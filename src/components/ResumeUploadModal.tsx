import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";

interface ResumeUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAnalysisComplete: () => void;
}

export function ResumeUploadModal({ open, onOpenChange, onAnalysisComplete }: ResumeUploadModalProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      
      // Simulate processing
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        // Here you would normally process the resume
        console.log("Processing resume:", file.name);
      }, 2000);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxFiles: 1,
  });

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setIsProcessing(false);
  };

  const handleAnalyze = () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    // Simulate skill extraction and analysis
    setTimeout(() => {
      setIsProcessing(false);
      onOpenChange(false);
      onAnalysisComplete();
      // Reset modal state
      setTimeout(() => {
        setUploadedFile(null);
      }, 300);
    }, 3000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pixelated-border bg-[#1a1a1b] border-4 border-[#ff4500] max-w-[75vw] sm:max-w-md md:max-w-lg p-0 gap-0 [&>button]:hidden max-h-[75vh] overflow-y-auto">
        <DialogTitle className="sr-only">Upload Resume</DialogTitle>
        <DialogDescription className="sr-only">
          Upload your resume to analyze your skills and discover AI risk scores
        </DialogDescription>
        
        {/* Header */}
        <div className="border-b-4 border-[#343536] p-3 sm:p-4 flex items-center justify-between">
          <h2 className="pixel-text text-[#ff4500] text-xs">
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
        <div className="p-3 sm:p-4">
          <p className="pixel-text text-[#d7dadc] mb-3 text-center text-xs">
            Drop your resume to reveal your skills
          </p>

          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`
              pixelated-border border-4 border-dashed p-5 sm:p-6 
              flex flex-col items-center justify-center gap-2 sm:gap-3
              cursor-pointer transition-all min-h-[150px]
              ${isDragActive 
                ? 'border-[#ff4500] bg-[#ff4500]/10' 
                : 'border-[#343536] hover:border-[#ff4500]/50'
              }
            `}
          >
            <input {...getInputProps()} />
            
            {uploadedFile ? (
              <div className="flex flex-col items-center gap-2 w-full">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-[#ff4500]" />
                <div className="text-center w-full">
                  <p className="pixel-text text-white mb-1 text-xs break-all px-2">
                    {uploadedFile.name}
                  </p>
                  <p className="pixel-text text-[#d7dadc] opacity-70 mb-2 text-xs">
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                  
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="pixel-text text-[#ff4500]">
                        processing...
                      </div>
                      <div className="w-full max-w-xs h-4 pixelated-border border-2 border-[#343536] bg-[#0a0a0a]">
                        <div 
                          className="h-full bg-[#ff4500] animate-pulse"
                          style={{ width: '60%' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                      className="pixelated-border bg-transparent border-2 border-[#343536] text-[#d7dadc] px-4 py-2 hover:border-[#ff4500] hover:text-[#ff4500] transition-colors pixel-text"
                    >
                      remove file
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-[#343536]" />
                <div className="text-center">
                  <p className="pixel-text text-white mb-1 text-xs">
                    {isDragActive ? 'drop it here!' : 'drag & drop resume'}
                  </p>
                  <p className="pixel-text text-[#d7dadc] opacity-70 text-xs">
                    or click to browse
                  </p>
                </div>
                <p className="pixel-text text-[#d7dadc] opacity-50 text-xs">
                  PDF, DOC, DOCX up to 10MB
                </p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mt-3 justify-center">
            <button
              onClick={() => onOpenChange(false)}
              className="pixelated-border bg-transparent border-2 border-[#343536] text-[#d7dadc] px-4 py-1.5 hover:border-[#ff4500] hover:text-white transition-colors pixel-text text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleAnalyze}
              disabled={!uploadedFile || isProcessing}
              className="pixelated-border bg-[#ff4500] border-2 border-[#ff4500] text-white px-4 py-1.5 hover:bg-[#ff5722] hover:border-[#ff5722] transition-colors pixel-text disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
              Analyze Skills
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
