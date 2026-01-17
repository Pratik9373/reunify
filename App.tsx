
import React, { useState, useCallback } from 'react';
import { PhotoState, LoadingStep } from './types';
import ImageUploader from './components/ImageUploader';
import LoadingOverlay from './components/LoadingOverlay';
import { generateReunion, applyImageEdit } from './services/geminiService';

const App: React.FC = () => {
  const [childPhoto, setChildPhoto] = useState<PhotoState>({ file: null, preview: null });
  const [adultPhoto, setAdultPhoto] = useState<PhotoState>({ file: null, preview: null });
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>(LoadingStep.IDLE);
  const [editPrompt, setEditPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleChildSelect = (file: File) => {
    setChildPhoto({
      file,
      preview: URL.createObjectURL(file)
    });
    setError(null);
  };

  const handleAdultSelect = (file: File) => {
    setAdultPhoto({
      file,
      preview: URL.createObjectURL(file)
    });
    setError(null);
  };

  const handleGenerate = async () => {
    if (!childPhoto.file || !adultPhoto.file) {
      setError("Please upload both photos to continue.");
      return;
    }

    try {
      setLoadingStep(LoadingStep.GENERATING_REUNION);
      const result = await generateReunion(childPhoto.file, adultPhoto.file);
      if (result) {
        setResultImage(result);
      } else {
        setError("Generation failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during generation. Ensure your API key is valid.");
    } finally {
      setLoadingStep(LoadingStep.IDLE);
    }
  };

  const handleApplyEdit = async () => {
    if (!resultImage || !editPrompt.trim()) return;

    try {
      setLoadingStep(LoadingStep.APPLYING_EDITS);
      const result = await applyImageEdit(resultImage, editPrompt);
      if (result) {
        setResultImage(result);
        setEditPrompt('');
      } else {
        setError("Editing failed. Please try a different prompt.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while editing.");
    } finally {
      setLoadingStep(LoadingStep.IDLE);
    }
  };

  const handleReset = () => {
    setChildPhoto({ file: null, preview: null });
    setAdultPhoto({ file: null, preview: null });
    setResultImage(null);
    setError(null);
  };

  const downloadImage = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `reunify-portrait-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">
      <LoadingOverlay step={loadingStep} />

      <header className="max-w-4xl w-full text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <i className="fa-solid fa-people-group text-white text-xl"></i>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Reunify</h1>
        </div>
        <p className="text-slate-500 text-lg max-w-lg mx-auto">
          Bridge the decades. Upload a photo of yourself as a child and as an adult to see them meet in a shared moment.
        </p>
      </header>

      <main className="max-w-4xl w-full">
        {!resultImage ? (
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 px-1">Past Self</h3>
                <ImageUploader 
                  label="Childhood Photo" 
                  preview={childPhoto.preview} 
                  onImageSelect={handleChildSelect} 
                  icon="fa-solid fa-child"
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 px-1">Present Self</h3>
                <ImageUploader 
                  label="Recent Photo" 
                  preview={adultPhoto.preview} 
                  onImageSelect={handleAdultSelect} 
                  icon="fa-solid fa-user"
                />
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-3 border border-red-100">
                <i className="fa-solid fa-circle-exclamation"></i>
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!childPhoto.file || !adultPhoto.file || loadingStep !== LoadingStep.IDLE}
              className={`w-full py-4 rounded-2xl text-white font-bold text-lg transition-all shadow-lg ${
                !childPhoto.file || !adultPhoto.file 
                  ? 'bg-slate-300 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-[0.98]'
              }`}
            >
              Generate Reunion Moment
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-8 rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 animate-in fade-in zoom-in duration-500">
              <div className="relative aspect-square md:aspect-video bg-slate-100 rounded-2xl overflow-hidden group">
                <img 
                  src={resultImage} 
                  alt="Generated Reunion" 
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={downloadImage}
                    className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors text-slate-700"
                    title="Download Photo"
                  >
                    <i className="fa-solid fa-download"></i>
                  </button>
                </div>
              </div>

              <div className="mt-8">
                <label className="block text-sm font-bold text-slate-700 mb-2 px-1">
                  Fine-tune with text prompts
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="e.g., 'Add a retro film filter' or 'Make it warmer'"
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyEdit()}
                  />
                  <button
                    onClick={handleApplyEdit}
                    disabled={!editPrompt.trim() || loadingStep !== LoadingStep.IDLE}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <i className="fa-solid fa-magic-wand-sparkles"></i>
                    <span>Apply</span>
                  </button>
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  Try prompts like: "Add a soft warm glow", "Make it look like a polaroid", or "Adjust lighting to be more dramatic".
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center px-4">
              <button
                onClick={handleReset}
                className="text-slate-500 hover:text-indigo-600 font-medium transition-colors flex items-center gap-2"
              >
                <i className="fa-solid fa-arrow-left"></i>
                Start Over
              </button>
              
              <div className="flex items-center gap-2 text-slate-400 text-sm italic">
                <i className="fa-solid fa-shield-halved"></i>
                Privacy First: Your photos are only used for generation.
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto py-8 text-slate-400 text-sm font-medium">
        &copy; {new Date().getFullYear()} Reunify. Powered by Gemini 2.5 Flash Image.
      </footer>
    </div>
  );
};

export default App;
