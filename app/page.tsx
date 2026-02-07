'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HugeiconsIcon } from '@hugeicons/react';
import { jsPDF } from 'jspdf';
import {
  Copy01Icon, 
  Download01Icon, 
  CheckmarkCircle02Icon,
  File01Icon as FileDocumentIcon,
  Briefcase02Icon,
  SparklesIcon,
  JobSearchIcon,
  LegalDocumentIcon,
  Cursor01Icon as CursorMagicIcon
} from '@hugeicons/core-free-icons';

export default function CoverLetterGenerator() {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [completion, setCompletion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll as text generates
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [completion]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume || !jobDescription) return;

    setIsLoading(true);
    setCompletion('');

    try {
      const combinedPrompt = `Please generate a professional cover letter for this resume:\n${resume}\n\nBased on this job description:\n${jobDescription}`;
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: combinedPrompt }),
      });

      if (!response.ok) throw new Error('Failed to generate');
      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setCompletion((prev) => prev + chunk);
      }
    } catch (error) {
      console.error('Generation Error:', error);
      alert('Failed to generate cover letter. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(completion);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = pageWidth - margin * 2;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(completion, textWidth);
    doc.text(splitText, margin, margin);
    doc.save('cover-letter.pdf');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#475569] selection:bg-primary/10">
      {/* Top Navigation */}
      <nav className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#2563EB]/10 p-2 rounded-lg">
              <HugeiconsIcon icon={JobSearchIcon} className="text-[#2563EB] w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-[#0F172A]">CoverWriter AI</span>
          </div>
          
          <div className="flex items-center gap-3">
            {completion && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyToClipboard}
                  className="rounded-lg bg-white border-slate-200 hover:bg-slate-50 transition-all gap-2 h-9"
                >
                  <HugeiconsIcon icon={isCopied ? CheckmarkCircle02Icon : Copy01Icon} className={`w-4 h-4 ${isCopied ? 'text-green-500' : ''}`} />
                  {isCopied ? 'Copied' : 'Copy'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadPDF}
                  className="rounded-lg bg-white border-slate-200 hover:bg-slate-50 transition-all gap-2 h-9"
                >
                  <HugeiconsIcon icon={Download01Icon} className="w-4 h-4" />
                  Save as PDF
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-screen-2xl mx-auto p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
          
          {/* Left Side: Inputs */}
          <div className="space-y-6">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
                      <HugeiconsIcon icon={FileDocumentIcon} className="w-4 h-4 text-[#2563EB]" />
                      Professional Resume
                    </label>
                    <Textarea 
                      placeholder="Paste your resume content here..." 
                      className="min-h-[200px] bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl resize-none"
                      value={resume}
                      onChange={(e) => setResume(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
                      <HugeiconsIcon icon={Briefcase02Icon} className="w-4 h-4 text-[#2563EB]" />
                      Job Description
                    </label>
                    <Textarea 
                      placeholder="Paste the job requirements here..." 
                      className="min-h-[160px] bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl resize-none"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleGenerate} 
                  disabled={isLoading || !resume || !jobDescription}
                  className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-12 rounded-xl font-semibold transition-all shadow-md shadow-blue-500/10"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Crafting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={SparklesIcon} className="w-4 h-4" />
                      Generate Letter
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Side: Results */}
          <div className="h-full">
            <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden min-h-[700px] flex flex-col">
              <div className="px-6 py-4 border-b bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 uppercase tracking-tight">
                  <HugeiconsIcon icon={LegalDocumentIcon} className="w-4 h-4 text-[#2563EB]" />
                  Generated Cover Letter
                </h3>
              </div>
              
              <ScrollArea className="flex-1 p-8 lg:p-12 bg-[#EFF6FF]/20" ref={scrollRef}>
                {!completion && !isLoading ? (
                  <div className="h-[500px] flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                      <HugeiconsIcon icon={CursorMagicIcon} className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium max-w-[240px]">
                      Enter your details to generate a customized cover letter
                    </p>
                  </div>
                ) : (
                  <div className="bg-white shadow-sm border border-slate-100 p-10 lg:p-16 min-h-[800px] rounded-sm mx-auto max-w-[800px]">
                    <div className="whitespace-pre-wrap text-[#334155] leading-relaxed text-base font-medium">
                      {completion}
                      {isLoading && (
                        <span className="inline-block w-1.5 h-5 ml-1 bg-[#2563EB] animate-pulse align-middle" />
                      )}
                    </div>
                  </div>
                )}
              </ScrollArea>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

