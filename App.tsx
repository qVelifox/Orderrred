import React, { useState, useCallback, useMemo } from 'react';
import FoodItemCard from './components/FoodItemCard';
import { sendOrderToDiscord } from './services/discordService';
import type { FoodItem, CartItem, OrderDetails } from './types';
import { PaymentMethod } from './types';

const FOOD_ITEMS: FoodItem[] = [
  { id: 1, name: 'Test 1', price: 1.50, imageUrl: '' },
  { id: 2, name: 'Test 2', price: 2.50, imageUrl: '' },
  { id: 3, name: 'Test 3', price: 3.50, imageUrl: '' },
  { id: 4, name: 'Test 4', price: 4.50, imageUrl: '' },
  { id: 5, name: 'Test 5', price: 5.50, imageUrl: '' },
  { id: 6, name: 'Test 6', price: 6.50, imageUrl: '' },
  { id: 7, name: 'Test 7', price: 7.50, imageUrl: '' },
  { id: 8, name: 'Test 8', price: 8.50, imageUrl: '' }
];

const TAX_RATE = 0.1; // 10%

type Page = 'products' | 'cart' | 'checkout' | 'success';

// Sub-components for each page
const Header: React.FC<{ page: Page; onNavigate: (page: Page) => void; cartCount: number }> = ({ page, onNavigate, cartCount }) => {
  const titles: Record<Page, string> = {
    products: 'Nos produits',
    cart: 'Mon Panier',
    checkout: 'Paiement',
    success: 'Confirmation',
  };

  return (
    <header className="sticky top-0 bg-stone-50/80 backdrop-blur-md z-10 p-4 flex items-center justify-between border-b border-stone-200">
      {page !== 'products' ? (
        <button onClick={() => onNavigate(page === 'checkout' ? 'cart' : 'products')} className="p-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
      ) : (
        <button className="p-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
      )}
      <h1 className="text-lg font-bold">{titles[page]}</h1>
      <button onClick={() => onNavigate('cart')} className="p-2 relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          {cartCount > 0 && <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">{cartCount}</span>}
      </button>
    </header>
  );
};

const ProductListPage: React.FC<{ onAddToCart: (item: FoodItem) => void; onNavigate: (page: Page) => void; cartCount: number }> = ({ onAddToCart, onNavigate, cartCount }) => (
    <div className="p-4 pb-24">
        <div className="max-w-7xl mx-auto">
            <div className="relative mb-6">
                <input type="text" placeholder="Rechercher des produits" className="w-full bg-white border border-stone-300 rounded-full p-3 pl-10 focus:ring-2 focus:ring-orange-400 outline-none transition" />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {FOOD_ITEMS.map(item => <FoodItemCard key={item.id} item={item} onAddToCart={onAddToCart} />)}
            </div>
        </div>
        {cartCount > 0 && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-sm px-4">
                <button onClick={() => onNavigate('cart')} className="w-full bg-blue-500 text-white font-bold py-4 px-6 rounded-full shadow-lg hover:bg-blue-600 transition-all">
                    Voir le panier ({cartCount})
                </button>
            </div>
        )}
    </div>
);

const CartPage: React.FC<{ cart: CartItem[], onUpdateQuantity: (id: number, quantity: number) => void, onNavigate: (page: Page) => void }> = ({ cart, onUpdateQuantity, onNavigate }) => {
    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
    const taxes = useMemo(() => subtotal * TAX_RATE, [subtotal]);
    const total = useMemo(() => subtotal + taxes, [subtotal, taxes]);

    if (cart.length === 0) {
        return (
            <div className="text-center p-8 max-w-3xl mx-auto">
                <h2 className="text-xl font-semibold mb-2">Votre panier est vide</h2>
                <button onClick={() => onNavigate('products')} className="text-orange-500 font-semibold">Continuer les achats</button>
            </div>
        );
    }

    return (
        <div className="p-4 flex flex-col h-[calc(100vh-65px)]">
            <div className="max-w-3xl mx-auto w-full flex flex-col flex-grow">
                <div className="flex-grow overflow-y-auto">
                    {cart.map(item => (
                        <div key={item.id} className="flex items-center gap-4 mb-4 bg-white p-3 rounded-2xl">
                            <div className="w-16 h-16 bg-gray-200 rounded-md" style={{ backgroundImage: `url(${item.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                            <div className="flex-grow">
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-gray-600">{item.price.toFixed(2)}€</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-lg">-</button>
                                <span className="w-8 text-center font-bold">{item.quantity}</span>
                                <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-lg">+</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="pt-4 border-t border-stone-200">
                    <div className="flex justify-between text-gray-600 mb-1"><p>Sous-total</p><p>{subtotal.toFixed(2)}€</p></div>
                    <div className="flex justify-between text-gray-600 mb-2"><p>Taxes</p><p>{taxes.toFixed(2)}€</p></div>
                    <div className="flex justify-between font-bold text-xl mb-4"><p>Total</p><p>{total.toFixed(2)}€</p></div>
                    <button onClick={() => onNavigate('checkout')} className="w-full bg-orange-500 text-white font-bold py-4 rounded-full shadow-lg hover:bg-orange-600 transition-all mb-2">Finaliser la commande</button>
                    <button onClick={() => onNavigate('products')} className="w-full text-orange-500 font-semibold py-2">Continuer les achats</button>
                </div>
            </div>
        </div>
    );
};

const CheckoutPage: React.FC<{ cart: CartItem[], onSubmit: (details: OrderDetails) => Promise<void> }> = ({ cart, onSubmit }) => {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const total = useMemo(() => {
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return subtotal + (subtotal * TAX_RATE);
    }, [cart]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName || !lastName) {
            alert('Veuillez entrer votre prénom et votre nom.');
            return;
        }
        if (!contactInfo) {
            alert('Veuillez entrer votre pseudo Snapchat ou votre numéro de téléphone.');
            return;
        }
        setIsLoading(true);
        await onSubmit({ 
            firstName, 
            lastName, 
            contactInfo, 
            paymentMethod 
        });
        setIsLoading(false);
    };

    return (
        <div className="p-4 flex flex-col h-[calc(100vh-65px)]">
             <div className="max-w-3xl mx-auto w-full flex flex-col flex-grow">
                <div className="flex-grow">
                    <h2 className="text-2xl font-bold mb-2">Finaliser ma commande</h2>
                    <p className="text-gray-600 mb-6">Pour finaliser votre commande, veuillez sélectionner une option de paiement et nous fournir un moyen de vous contacter.</p>
                    
                    <div className="space-y-4 mb-6">
                        <label className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer ${paymentMethod === PaymentMethod.Cash ? 'border-orange-500 ring-2 ring-orange-400' : 'border-gray-300'}`}>
                            <input type="radio" name="payment" className="hidden" value={PaymentMethod.Cash} checked={paymentMethod === PaymentMethod.Cash} onChange={() => setPaymentMethod(PaymentMethod.Cash)} />
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            <span className="font-semibold flex-grow">Paiement en Espèces</span>
                            <div className={`w-5 h-5 rounded-full border-2 ${paymentMethod === PaymentMethod.Cash ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}></div>
                        </label>
                        <label className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer ${paymentMethod === PaymentMethod.PayPal ? 'border-orange-500 ring-2 ring-orange-400' : 'border-gray-300'}`}>
                            <input type="radio" name="payment" className="hidden" value={PaymentMethod.PayPal} checked={paymentMethod === PaymentMethod.PayPal} onChange={() => setPaymentMethod(PaymentMethod.PayPal)} />
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M8.32,20.25H4.43a.5.5,0,0,1-.49-.66L6.5,5.76A.5.5,0,0,1,7,5.27H11a.5.5,0,0,1,.5.45l-1.8,11.49a.5.5,0,0,1-.5.54H8.81a.5.5,0,0,0-.5.54,0,0,0,0,.07.5.5,0,0,1-.49.5Zm12.4-15H15.15a.5.5,0,0,0-.5.45L12.87,19.6a.5.5,0,0,0,.5.55h2.37a.5.5,0,0,0,.49-.36l.57-3.48a.5.5,0,0,1,.49-.44h.1a.5.5,0,0,0,.48-.39l1.1-6.91a.5.5,0,0,0-.14-.52.5.5,0,0,0-.37-.15h-1a.5.5,0,0,0-.5.45L15.77,11a.5.5,0,0,1-.49.46h-.1a.5.5,0,0,0-.48.39l-.38,2.37h.89a.5.5,0,0,0,.49-.36l.57-3.48a.5.5,0,0,1,.49-.44H17.6a.5.5,0,0,0,.48-.39L19,5.76a.5.5,0,0,0-.14-.52.5.5,0,0,0-.37-.15Z"/></svg>
                            <span className="font-semibold flex-grow">PayPal</span>
                            <div className={`w-5 h-5 rounded-full border-2 ${paymentMethod === PaymentMethod.PayPal ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}></div>
                        </label>
                    </div>
                    
                    <div className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="font-semibold mb-2 block">Prénom</label>
                                <input 
                                    type="text" 
                                    placeholder="Votre prénom" 
                                    value={firstName} 
                                    onChange={(e) => setFirstName(e.target.value)} 
                                    className="w-full bg-white border border-stone-300 rounded-full p-4 pl-4 focus:ring-2 focus:ring-orange-400 outline-none transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="font-semibold mb-2 block">Nom</label>
                                <input 
                                    type="text" 
                                    placeholder="Votre nom" 
                                    value={lastName} 
                                    onChange={(e) => setLastName(e.target.value)} 
                                    className="w-full bg-white border border-stone-300 rounded-full p-4 pl-4 focus:ring-2 focus:ring-orange-400 outline-none transition"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="font-semibold mb-2 block">Pseudo Snapchat ou N° de téléphone</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Entrez votre contact" 
                                    value={contactInfo} 
                                    onChange={(e) => setContactInfo(e.target.value)} 
                                    className="w-full bg-white border border-stone-300 rounded-full p-4 pl-12 focus:ring-2 focus:ring-orange-400 outline-none transition" 
                                    required
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">Nous vous contacterons pour les détails de la livraison.</p>
                        </div>
                    </div>

                </div>
                <div className="pt-4 border-t border-stone-200">
                    <div className="flex justify-between font-bold text-xl mb-4"><p>Total</p><p>{total.toFixed(2)}€</p></div>
                    <button onClick={handleSubmit} disabled={isLoading} className="w-full bg-orange-500 text-white font-bold py-4 rounded-full shadow-lg hover:bg-orange-600 transition-all disabled:bg-orange-300 flex justify-center items-center">
                        {isLoading ? <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Commander'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const SuccessPage: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => (
    <div className="text-center p-8 flex flex-col items-center justify-center h-[calc(100vh-65px)]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <h2 className="text-2xl font-bold mb-2">Commande envoyée !</h2>
        <p className="text-gray-600 mb-6">Merci pour votre confiance. Nous vous contacterons bientôt.</p>
        <button onClick={() => onNavigate('products')} className="bg-orange-500 text-white font-bold py-3 px-6 rounded-full">Retour à l'accueil</button>
    </div>
);

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('products');
  const [cart, setCart] = useState<CartItem[]>([]);

  const handleAddToCart = useCallback((item: FoodItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  }, []);
  
  const handleUpdateQuantity = useCallback((id: number, quantity: number) => {
      setCart(prevCart => {
          if(quantity <= 0) {
              return prevCart.filter(item => item.id !== id);
          }
          return prevCart.map(item => item.id === id ? {...item, quantity} : item);
      })
  }, []);
  
  const handleSubmitOrder = useCallback(async (orderDetails: OrderDetails) => {
    try {
      await sendOrderToDiscord(orderDetails, cart);
      setCart([]);
      setPage('success');
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue lors de l'envoi de votre commande.");
    }
  }, [cart]);
  
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const renderPage = () => {
      switch (page) {
          case 'products': return <ProductListPage onAddToCart={handleAddToCart} onNavigate={setPage} cartCount={cartCount}/>;
          case 'cart': return <CartPage cart={cart} onUpdateQuantity={handleUpdateQuantity} onNavigate={setPage} />;
          case 'checkout': return <CheckoutPage cart={cart} onSubmit={handleSubmitOrder} />;
          case 'success': return <SuccessPage onNavigate={setPage} />;
          default: return <ProductListPage onAddToCart={handleAddToCart} onNavigate={setPage} cartCount={cartCount}/>;
      }
  };

  return (
    <div className="bg-stone-50 min-h-screen font-sans flex flex-col">
       <Header page={page} onNavigate={setPage} cartCount={cartCount} />
       <main className="flex-grow">
        {renderPage()}
       </main>
    </div>
  );
}

export default App;
