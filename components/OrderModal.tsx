

import React, { useState, useCallback } from 'react';
import type { FoodItem, OrderDetails } from '../types';
import { PaymentMethod } from '../types';

interface OrderModalProps {
  item: FoodItem;
  onClose: () => void;
  onSubmit: (orderDetails: OrderDetails) => Promise<void>;
}

const OrderModal: React.FC<OrderModalProps> = ({ item, onClose, onSubmit }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.PayPal);
  const [isLoading, setIsLoading] = useState(false);

  // FIX: The onSubmit prop expects an object matching the OrderDetails type.
  // The original code passed properties (`firstName`, `lastName`, `phoneNumber`) that do not exist on OrderDetails.
  // This has been corrected to combine these fields into a single `contactInfo` string.
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !phoneNumber) {
      alert('Veuillez remplir tous les champs.');
      return;
    }
    setIsLoading(true);
    await onSubmit({
      contactInfo: `${firstName} ${lastName} (${phoneNumber})`,
      paymentMethod,
    });
    setIsLoading(false);
  }, [firstName, lastName, phoneNumber, paymentMethod, onSubmit]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-8 relative transform transition-all duration-300 scale-95 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Fermer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-3xl font-extrabold text-white mb-2">Commander: <span className="text-indigo-400">{item.name}</span></h2>
        <p className="text-gray-300 mb-6">Prix: {item.price.toFixed(2)}€</p>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input 
              type="text" 
              placeholder="Prénom" 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              required 
            />
            <input 
              type="text" 
              placeholder="Nom" 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              required 
            />
          </div>
          <div className="mb-6">
            <input 
              type="tel" 
              placeholder="Numéro de téléphone" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              required 
            />
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-300 mb-3">Moyen de paiement</h3>
            <div className="flex space-x-4">
              {/* FIX: The cast `as Array<keyof typeof PaymentMethod>` was incorrect because Object.values() returns an enum's values, not its keys.
                  The correct type for `method` is `PaymentMethod`, which is achieved by casting to `PaymentMethod[]`. */}
              {(Object.values(PaymentMethod) as PaymentMethod[]).map((method) => (
                <label key={method} className="flex-1">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className="sr-only peer"
                  />
                  <div className="text-center p-3 rounded-md cursor-pointer bg-gray-700 border border-gray-600 peer-checked:bg-indigo-600 peer-checked:border-indigo-500 peer-checked:ring-2 peer-checked:ring-indigo-500 transition-all duration-200">
                    {method}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed disabled:text-gray-400 transition-all duration-300 flex justify-center items-center"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : `Envoyer la commande - ${item.price.toFixed(2)}€`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;
