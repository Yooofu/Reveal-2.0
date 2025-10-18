import { useCallback, useState, useEffect } from "react";
import { useDropzone, Accept } from "react-dropzone";
import { Upload, FileText, X, CheckCircle2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface ResumeUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAnalysisComplete: (resumeId: string) => void;
}

export function ResumeUploadModal({ open, onOpenChange, onAnalysisComplete }: ResumeUploadModalProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'parsing' | 'analyzing' | 'discovering' | 'finalizing' | 'success' | 'error'>('idle');
  const [processingResumeId, setProcessingResumeId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const generateUploadUrl = useMutation(api.controllers.resumeController.generateUploadUrl);
  const createResume = useMutation(api.controllers.resumeController.createResume);
  
  // Poll for analysis completion
  const analysisData = useQuery(
    api.controllers.analysisController.getAnalysisWithSkills,
    processingResumeId ? { resumeId: processingResumeId as any } : "skip"
  );

  // Watch for analysis completion
  useEffect(() => {
    if (!processingResumeId || !isProcessing) return;
    
    if (analysisData && analysisData.skills && analysisData.skills.length > 0) {
      // Analysis is complete!
      setUploadProgress(100);
      setUploadStatus('success');
      
      // Wait a moment to show success state
      setTimeout(() => {
        setIsProcessing(false);
        onOpenChange(false);
        onAnalysisComplete(processingResumeId);
        
        // Reset modal state after closing
        setTimeout(() => {
          setUploadedFile(null);
          setUploadStatus('idle');
          setUploadProgress(0);
          setProcessingResumeId(null);
        }, 300);
      }, 1000);
    }
  }, [analysisData, processingResumeId, isProcessing, onAnalysisComplete, onOpenChange]);

  // Subtle progress animation during finalizing stage
  useEffect(() => {
    if (uploadStatus === 'finalizing' && uploadProgress < 95) {
      const timer = setTimeout(() => {
        setUploadProgress(prev => Math.min(prev + 1, 95));
      }, 2000); // Increment by 1% every 2 seconds
      return () => clearTimeout(timer);
    }
  }, [uploadStatus, uploadProgress]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      setUploadStatus('idle');
      setUploadProgress(0);
    }
  }, []);

  const acceptedFileTypes: Accept = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/msword': ['.doc'],
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles: 1,
  } as any);

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setIsProcessing(false);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;
    
    try {
      setIsProcessing(true);
      setUploadStatus('uploading');
      setUploadProgress(10);

      // Step 1: Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();
      setUploadProgress(25);

      // Step 2: Upload file to Convex storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": uploadedFile.type },
        body: uploadedFile,
      });

      if (!result.ok) {
        throw new Error("File upload failed");
      }

      const { storageId } = await result.json();
      setUploadProgress(40);
      
      // Step 3: Parsing document
      setUploadStatus('parsing');
      setUploadProgress(50);

      // Step 4: Create resume and trigger analysis
      const resumeId = await createResume({
        storageId,
        fileName: uploadedFile.name,
        fileSize: uploadedFile.size,
      });
      
      // Store the resume ID to start polling for results
      setProcessingResumeId(resumeId);
      
      setUploadProgress(60);

      // Step 5: Analyzing with AI
      setUploadStatus('analyzing');
      setUploadProgress(70);
      
      // Step 6: Discovering AI tools
      setUploadStatus('discovering');
      setUploadProgress(80);
      
      // Step 7: Finalizing (waiting for real data now)
      setUploadStatus('finalizing');
      setUploadProgress(85);
      
      // Now we wait for the useEffect to detect when analysisData is ready
      // and complete the process automatically
      
    } catch (error) {
      console.error("Resume upload failed:", error);
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed. Please try again.');
      setIsProcessing(false);
      setProcessingResumeId(null);
    }
  };

  const handleRetry = () => {
    setUploadStatus('idle');
    setUploadProgress(0);
    setErrorMessage('');
    setProcessingResumeId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ paddingLeft: '10px', paddingRight: '10px', paddingBottom: '10px', paddingTop: '10px' }} className="pixelated-border bg-[#1a1a1b] border-4 border-[#ff4500]  p-0 gap-0 [&>button]:hidden max-h-[75vh] overflow-y-auto">
        <DialogTitle className="sr-only">Upload Resume</DialogTitle>
        <DialogDescription className="sr-only">
          Upload your resume to analyze your skills and discover AI risk scores
        </DialogDescription>
        
        {/* Header */}
        <div className="border-b-4 border-[#343536] p-3 sm:p-4 flex items-center justify-between" style={{marginTop: '10px'}}>
          <h2 className="pixel-text text-[#ff4500] ml-[10px] text-xs">
            Upload Resume
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-[#d7dadc] hover:text-[#ff4500] transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-6" style={{ paddingLeft: '20px', paddingRight: '20px', paddingBottom: '20px', paddingTop: '20px' }}>
          <p className="pixel-text text-[#d7dadc] mb-3 text-center text-xs">
            Drop your resume to reveal your skills
          </p>

          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`
              pixelated-border border-4 border-dashed p-6 sm:p-8 py-[10px]
              flex flex-col items-center justify-center gap-3 sm:gap-4
              cursor-pointer transition-all min-h-[180px] sm:min-h-[200px] 
              ${isDragActive 
                ? 'border-[#ff4500] bg-[#ff4500]/10' 
                : 'border-[#343536] hover:border-[#ff4500]/50'
              }
            `}
          >
            <input {...getInputProps()} />
            
            {uploadedFile ? (
              <div className="flex flex-col items-center gap-3 w-full py-[10px]">
                <FileText className="w-12 h-12 sm:w-14 sm:h-14 text-[#ff4500]" />
                <div className="text-center w-full">
                  <p className="pixel-text text-white mb-2 text-xs sm:text-sm break-all px-2">
                    {uploadedFile.name}
                  </p>
                  <p className="pixel-text text-[#d7dadc] opacity-70 mb-3 text-xs">
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                  
                      {uploadStatus === 'error' ? (
                        <div className="flex flex-col items-center gap-4">
                          <div className="pixel-text text-[#ef4444] text-xs text-center">
                            ❌ {errorMessage || 'analysis failed'}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRetry();
                            }}
                            className="pixelated-border bg-[#ff4500] border-2 border-[#ff4500] text-white px-4 py-2 hover:bg-[#ff5722] hover:border-[#ff5722] transition-colors pixel-text text-xs"
                          >
                            try again
                          </button>
                        </div>
                      ) : isProcessing ? (
                        <div className="flex flex-col items-center gap-4">
                          <div className="pixel-text text-[#ff4500] text-xs flex items-center gap-2">
                            {uploadStatus === 'uploading' && '⬆️ uploading file...'}
                            {uploadStatus === 'parsing' && '📄 parsing document...'}
                            {uploadStatus === 'analyzing' && '🤖 analyzing with ai...'}
                            {uploadStatus === 'discovering' && '🔍 discovering ai tools...'}
                            {uploadStatus === 'finalizing' && (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                extracting skills...
                              </>
                            )}
                            {uploadStatus === 'success' && (
                              <div className="flex items-center gap-2 text-[#22c55e]">
                                <CheckCircle2 className="w-4 h-4" />
                                analysis complete!
                              </div>
                            )}
                          </div>
                          <div className="w-full max-w-xs h-4 pixelated-border border-2 border-[#343536] bg-[#0a0a0a] overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                uploadStatus === 'success' ? 'bg-[#22c55e]' : 
                                uploadStatus === 'finalizing' ? 'bg-[#ff4500] animate-pulse' :
                                'bg-[#ff4500]'
                              }`}
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <p className="pixel-text text-[#d7dadc] opacity-70 text-xs">
                            {uploadStatus === 'finalizing' ? 'this may take a moment...' : `${uploadProgress}%`}
                          </p>
                        </div>
                      ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                      className="pixelated-border bg-transparent border-2 border-[#343536] text-[#d7dadc] px-4 py-2 hover:border-[#ff4500] hover:text-[#ff4500] transition-colors pixel-text text-xs"
                    >
                      remove file
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 sm:w-14 sm:h-14 text-[#343536]" />
                <div className="text-center">
                  <p className="pixel-text text-white mb-2 text-xs sm:text-sm">
                    {isDragActive ? 'drop it here!' : 'drag & drop resume'}
                  </p>
                  <p className="pixel-text text-[#d7dadc] opacity-70 text-xs">
                    or click to browse
                  </p>
                </div>
                <p className="pixel-text text-[#d7dadc] opacity-50 text-xs">
                  DOCX File Types ONLYYYYY
                </p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mt-3 justify-center" style={{ marginTop: '20px' }}>
            <button
              onClick={() => onOpenChange(false)}
              disabled={isProcessing && uploadStatus !== 'error'}
              className="pixelated-border bg-transparent border-2 border-[#343536] text-[#d7dadc] px-4 py-1.5 hover:border-[#ff4500] hover:text-white transition-colors pixel-text text-xs disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleAnalyze}
              disabled={!uploadedFile || isProcessing || uploadStatus === 'error'}
              className="pixelated-border bg-[#ff4500] border-2 border-[#ff4500] text-white px-4 py-1.5 hover:bg-[#ff5722] hover:border-[#ff5722] transition-colors pixel-text disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center gap-2 justify-center"
            >
              {isProcessing && uploadStatus !== 'error' && <Loader2 className="w-3 h-3 animate-spin" />}
              {isProcessing && uploadStatus !== 'error' ? 'Processing...' : 'Analyze Skills'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
