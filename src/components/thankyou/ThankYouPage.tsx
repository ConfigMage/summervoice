'use client';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-green-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="text-6xl">&#x1F31F;</div>

        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Thank You!
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Thank you so much for sharing your thoughts with us. Your feedback really matters and will help make summer programs even better for everyone!
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500">
            You can close this tab now. Have a great rest of your summer!
          </p>
        </div>
      </div>
    </div>
  );
}
