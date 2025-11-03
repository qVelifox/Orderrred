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
        <button className="p-2">
          <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.75 21.25H11.25M18.75 21.25H11.25M11.25 21.25V12.9464M11.25 12.9464L4.98958 6.25M11.25 12.9464L17.5104 6.25M4.98958 6.25L1.25 2.25V1.25H21.25V2.25L17.5104 6.25M4.98958 6.25H17.5104" stroke="#3B82F6" stroke-width="2.5"/>
          </svg>
        </button>
      )}
      <h1 className="text-lg font-bold">{titles[page]}</h1>
      <button onClick={() => onNavigate('cart')} className="p-2 relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          {cartCount > 0 && <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">{cartCount}</span>}
      </button>
    </header>
  );
};

const ProductListPage: React.FC<{ 
  onAddToCart: (item: FoodItem) => void; 
  onNavigate: (page: Page) => void; 
  cartCount: number 
}> = ({ onAddToCart, onNavigate, cartCount }) => (
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

const CartPage: React.FC<{ 
  cart: CartItem[], 
  onUpdateQuantity: (id: number, quantity: number) => void, 
  onNavigate: (page: Page) => void 
}> = ({ cart, onUpdateQuantity, onNavigate }) => {
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

const CheckoutPage: React.FC<{ 
  cart: CartItem[], 
  onSubmit: (details: OrderDetails) => Promise<void> 
}> = ({ cart, onSubmit }) => {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
    const [fullName, setFullName] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const total = useMemo(() => {
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return subtotal + (subtotal * TAX_RATE);
    }, [cart]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName) {
            alert('Veuillez entrer votre nom complet.');
            return;
        }
        if (!contactInfo) {
            alert('Veuillez entrer votre pseudo Snapchat ou votre numéro de téléphone.');
            return;
        }
        setIsLoading(true);
        await onSubmit({ 
            fullName,
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
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 48 48"><path fill="#1565C0" d="M18.7,13.767l0.005,0.002C18.809,13.326,19.187,13,19.66,13h13.472c0.017,0,0.034-0.007,0.051-0.006C32.896,8.215,28.887,6,25.35,6H11.878c-0.474,0-0.852,0.335-0.955,0.777l-0.005-0.002L5.029,33.813l0.013,0.001c-0.014,0.064-0.039,0.125-0.039,0.194c0,0.553,0.447,0.991,1,0.991h8.071L18.7,13.767z"/><path fill="#039BE5" d="M33.183,12.994c0.053,0.876-0.005,1.829-0.229,2.882c-1.281,5.995-5.912,9.115-11.635,9.115c0,0-3.47,0-4.313,0c-0.521,0-0.767,0.306-0.88,0.54l-1.74,8.049l-0.305,1.429h-0.006l-1.263,5.796l0.013,0.001c-0.014,0.064-0.039,0.125-0.039,0.194c0,0.553,0.447,1,1,1h7.333l0.013-0.01c0.472-0.007,0.847-0.344,0.945-0.788l0.018-0.015l1.812-8.416c0,0,0.126-0.803,0.97-0.803s4.178,0,4.178,0c5.723,0,10.401-3.106,11.683-9.102C42.18,16.106,37.358,13.019,33.183,12.994z"/><path fill="#283593" d="M19.66,13c-0.474,0-0.852,0.326-0.955,0.769L18.7,13.767l-2.575,11.765c0.113-0.234,0.359-0.54,0.88-0.54c0.844,0,4.235,0,4.235,0c5.723,0,10.432-3.12,11.713-9.115c0.225-1.053,0.282-2.006,0.229-2.882C33.166,12.993,33.148,13,33.132,13H19.66z"/></svg>
                            <span className="font-semibold flex-grow">PayPal</span>
                            <div className={`w-5 h-5 rounded-full border-2 ${paymentMethod === PaymentMethod.PayPal ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}></div>
                        </label>
                    </div>
                    
                    <div className="mb-6">
                        <div className="mb-4">
                            <label className="font-semibold mb-2 block">Nom complet</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Votre nom complet" 
                                    value={fullName} 
                                    onChange={(e) => setFullName(e.target.value)} 
                                    className="w-full bg-white border border-stone-300 rounded-full p-4 pl-12 focus:ring-2 focus:ring-orange-400 outline-none transition"
                                    required
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
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

const SuccessPage: React.FC<{ 
  onNavigate: (page: Page) => void 
}> = ({ onNavigate }) => (
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
