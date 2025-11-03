import React from 'react';
import type { FoodItem } from '../types';

interface FoodItemCardProps {
  item: FoodItem;
  onAddToCart: (item: FoodItem) => void;
}

const FoodItemCard: React.FC<FoodItemCardProps> = ({ item, onAddToCart }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col">
      <div className="w-full h-40 bg-gray-200" style={{ backgroundImage: `url(${item.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="text-base font-semibold text-gray-800">{item.name}</h3>
          <p className="text-gray-500 mt-1">{item.price.toFixed(2)}€</p>
        </div>
        <button 
          onClick={() => onAddToCart(item)}
          className="mt-4 w-full bg-blue-100 text-blue-600 font-semibold py-3 px-4 rounded-full flex items-center justify-center gap-2 hover:bg-blue-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Ajouter
        </button>
      </div>
    </div>
  );
};

export default FoodItemCard;