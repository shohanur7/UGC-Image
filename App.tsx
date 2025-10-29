
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import Spinner from './components/Spinner';
import { generateProductImage } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';

// Define the Icon components right in App.tsx to avoid extra files for simple SVGs
const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
  </svg>
);

const ExclamationTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
  </svg>
);


const App: React.FC = () => {
  const [productImage, setProductImage] = useState<File | null>(null);
  const [influencerImage, setInfluencerImage] = useState<File | null>(null);

  const [productPreview, setProductPreview] = useState<string | null>(null);
  const [influencerPreview, setInfluencerPreview] = useState<string | null>(null);

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (file: File, type: 'product' | 'influencer') => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'product') {
        setProductImage(file);
        setProductPreview(reader.result as string);
      } else {
        setInfluencerImage(file);
        setInfluencerPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = (type: 'product' | 'influencer') => {
    if (type === 'product') {
      setProductImage(null);
      setProductPreview(null);
    } else {
      setInfluencerImage(null);
      setInfluencerPreview(null);
    }
  };

  const handleGenerateClick = useCallback(async () => {
    if (!productImage || !influencerImage) {
      setError('Please upload both a product and an influencer image.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const productBase64 = await fileToBase64(productImage);
      const influencerBase64 = await fileToBase64(influencerImage);

      const result = await generateProductImage(productBase64, influencerBase64);
      setGeneratedImage(result);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An unexpected error occurred while generating the image.');
    } finally {
      setIsLoading(false);
    }
  }, [productImage, influencerImage]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <Header />
      <main className="w-full max-w-6xl mx-auto flex flex-col items-center">
        <p className="mt-4 mb-8 text-lg text-center text-gray-300 max-w-3xl">
          Create stunning, professional product photos in seconds. Just upload a product image and a person's image, and let our AI craft the perfect lifestyle shot.
        </p>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <ImageUploader
            title="Product Image"
            description="Upload a clear image of your product."
            onImageSelect={(file) => handleImageSelect(file, 'product')}
            onImageRemove={() => handleImageRemove('product')}
            previewUrl={productPreview}
          />
          <ImageUploader
            title="Person / Influencer Image"
            description="Upload a photo of the person to feature."
            onImageSelect={(file) => handleImageSelect(file, 'influencer')}
            onImageRemove={() => handleImageRemove('influencer')}
            previewUrl={influencerPreview}
          />
        </div>
        
        <div className="w-full flex justify-center mb-8">
          <button
            onClick={handleGenerateClick}
            disabled={!productImage || !influencerImage || isLoading}
            className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 rounded-lg font-semibold text-lg hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-indigo-600/30 transform hover:scale-105"
          >
            {isLoading ? (
              <>
                <Spinner />
                Generating...
              </>
            ) : (
              <>
                <SparklesIcon className="w-6 h-6" />
                Generate Scene
              </>
            )}
          </button>
        </div>

        <div className="w-full max-w-3xl bg-gray-800/50 rounded-2xl p-4 border border-gray-700">
          <h2 className="text-xl font-bold text-center mb-4 text-indigo-300">Generated Image</h2>
          <div className="w-full aspect-square bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
            {isLoading && (
              <div className="flex flex-col items-center text-gray-400">
                <Spinner />
                <p className="mt-2 animate-pulse">AI is creating magic...</p>
              </div>
            )}
            {error && (
              <div className="p-4 text-center text-red-400 flex flex-col items-center gap-2">
                <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
                <p className="font-semibold">Generation Failed</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
            {generatedImage && !isLoading && (
              <img src={generatedImage} alt="Generated product scene" className="w-full h-full object-contain" />
            )}
            {!isLoading && !error && !generatedImage && (
              <p className="text-gray-500">Your generated image will appear here.</p>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;
