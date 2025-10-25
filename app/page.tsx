import React from 'react'
import Link from "next/link";

const page = () => {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center px-6 py-12 md:py-24">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900">
          Welcome to <span className="text-blue-600">SuiRent</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
          The decentralized marketplace for renting interactive assets on the Sui blockchain. Unlock the potential of your digital items or access what you need, right when you need it.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link 
            href="/marketplace" 
            className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Explore Marketplace
          </Link>
          <Link 
            href="/my-assets" 
            className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
          >
            List Your Assets
          </Link>
        </div>
      </div>

      <div className="w-full bg-white py-12 md:py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="feature">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                {/* Placeholder for an icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>
              </div>
              <h3 className="mt-5 text-lg font-medium text-gray-900">Earn Passive Income</h3>
              <p className="mt-2 text-base text-gray-500">
                Put your idle digital assets to work. List them for rent and generate a steady stream of income securely.
              </p>
            </div>
            <div className="feature">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                {/* Placeholder for an icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1v-4a6 6 0 016-6h4a6 6 0 016 6z" /></svg>
              </div>
              <h3 className="mt-5 text-lg font-medium text-gray-900">Rent with Ease</h3>
              <p className="mt-2 text-base text-gray-500">
                Access powerful in-game items, digital art, or utility NFTs for a fraction of the cost, for exactly as long as you need.
              </p>
            </div>
            <div className="feature">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                {/* Placeholder for an icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="mt-5 text-lg font-medium text-gray-900">Secure & Decentralized</h3>
              <p className="mt-2 text-base text-gray-500">
                Powered by Sui's object-centric model, all rentals are managed by smart contracts, ensuring trust and security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default page
