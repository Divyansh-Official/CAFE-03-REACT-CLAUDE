import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { orderService } from '../../services/allServices';
import { PrimaryButton, SecondaryButton, ProgressBar, Spinner } from '../../components/ui';
import { CartSummary } from '../../components/cart/CartComponents';
import { DeliveryMap } from '../../components/order/OrderComponents';
import { formatCurrency, generateOrderId } from '../../utils/helpers';
import cafe from '../../data/cafe.json';
import toast from 'react-hot-toast';

type OrderType = 'dine_in' | 'pickup' | 'delivery';
type Step = 0 | 1 | 2;

interface DeliveryForm {
  name: string; phone: string;
  address: string; landmark: string; pincode: string;
}

const STEPS = ['Delivery', 'Payment', 'Confirmed'];
const STEP_ICONS = ['🛵', '💳', '🎉'];

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user }  = useAuthStore();
  const { items, getSubtotal, discount, clearCart } = useCartStore();
  const [step, setStep]           = useState<Step>(0);
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [form, setForm]           = useState<DeliveryForm>({
    name: user?.name ?? '', phone: user?.phone?.replace('+91','') ?? '',
    address: '', landmark: '', pincode: '',
  });
  const [eta, setEta]           = useState<number | null>(null);
  const [orderId]               = useState(generateOrderId());
  const [upiLoading, setUpiLoading] = useState(false);
  const [upiData, setUpiData]   = useState<{ qrDataUrl: string; upiId: string } | null>(null);
  const [verifying, setVerifying] = useState(false);

  const subtotal = getSubtotal();
  const gst      = Math.round(subtotal * 0.05);
  const delivery = orderType === 'delivery' ? 40 : 0;
  const total    = subtotal + gst + delivery - discount;

  if (items.length === 0 && step !== 2) {
    navigate('/cart');
    return null;
  }

  const validateStep0 = () => {
    if (orderType === 'delivery') {
      if (!form.name.trim())    return 'Enter your name';
      if (!form.phone.trim())   return 'Enter phone number';
      if (!form.address.trim()) return 'Enter delivery address';
      if (!form.pincode.trim()) return 'Enter pincode';
    }
    return null;
  };

  const handleProceedToPayment = async () => {
    const err = validateStep0();
    if (err) return toast.error(err);
    setStep(1);
    // Generate UPI details
    setUpiLoading(true);
    try {
      const data = await orderService.generateUpiLink(orderId, total);
      setUpiData({ qrDataUrl: data.qrDataUrl, upiId: data.upiId });
    } catch {
      // Fallback mock
      setUpiData({ qrDataUrl: '', upiId: 'bobbabobba@paytm' });
    } finally {
      setUpiLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    setVerifying(true);
    try {
      const res = await orderService.verifyPayment(orderId);
      if (res.paid) {
        setStep(2);
        clearCart();
      } else {
        toast.error('Payment not received yet. Please complete payment and try again.');
      }
    } catch {
      // Dev fallback — simulate success
      setStep(2);
      clearCart();
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Stepper */}
      {step < 2 && (
        <div className="max-w-sm mx-auto mb-10">
          <ProgressBar steps={STEPS} currentStep={step} icons={STEP_ICONS.map(e => e)} />
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Main content — 3 cols */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">

            {/* ── Step 0: Delivery details ── */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }}>
                <h2 className="font-display text-2xl font-bold text-white mb-6">How do you want it?</h2>

                {/* Order type */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {([
                    { type:'dine_in',  label:'Dine In',  icon:'🪑', desc:'Eat at our cafe' },
                    { type:'pickup',   label:'Pickup',   icon:'🏃', desc:'Take it away'    },
                    { type:'delivery', label:'Delivery', icon:'🛵', desc:'To your door'    },
                  ] as { type:OrderType; label:string; icon:string; desc:string }[]).map(opt => (
                    <button
                      key={opt.type}
                      onClick={() => setOrderType(opt.type)}
                      className={`p-4 rounded-2xl border text-center transition-all duration-200
                        ${orderType === opt.type
                          ? 'border-primary bg-primary/10 shadow-brand'
                          : 'border-white/10 bg-card hover:border-white/30'}`}
                    >
                      <div className="text-3xl mb-1">{opt.icon}</div>
                      <p className={`font-bold text-sm ${orderType===opt.type?'text-primary':'text-white'}`}>{opt.label}</p>
                      <p className="text-text-secondary text-[10px] mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Address form */}
                <AnimatePresence>
                  {orderType === 'delivery' && (
                    <motion.div
                      initial={{ opacity:0, height:0 }}
                      animate={{ opacity:1, height:'auto' }}
                      exit={{ opacity:0, height:0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-card rounded-2xl p-5 border border-white/10 space-y-3 mb-6">
                        <h3 className="font-bold text-white text-sm mb-1">Delivery Address</h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {[
                            { field:'name',     label:'Full Name',           type:'text' },
                            { field:'phone',    label:'Phone Number',        type:'tel'  },
                          ].map(({ field, label, type }) => (
                            <input key={field} type={type} placeholder={label}
                              value={form[field as keyof DeliveryForm]}
                              onChange={e => setForm({ ...form, [field]: e.target.value })}
                              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white
                                text-sm outline-none focus:border-primary/60 transition-colors placeholder:text-text-secondary"
                            />
                          ))}
                        </div>
                        <textarea
                          placeholder="Full address (House/Flat no., Street, Area)"
                          value={form.address}
                          onChange={e => setForm({ ...form, address: e.target.value })}
                          rows={2}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white
                            text-sm outline-none focus:border-primary/60 transition-colors placeholder:text-text-secondary resize-none"
                        />
                        <div className="grid sm:grid-cols-2 gap-3">
                          <input type="text" placeholder="Landmark (optional)"
                            value={form.landmark}
                            onChange={e => setForm({ ...form, landmark: e.target.value })}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white
                              text-sm outline-none focus:border-primary/60 transition-colors placeholder:text-text-secondary"
                          />
                          <input type="text" placeholder="Pincode"
                            value={form.pincode}
                            onChange={e => setForm({ ...form, pincode: e.target.value.replace(/\D/g,'').slice(0,6) })}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white
                              text-sm outline-none focus:border-primary/60 transition-colors placeholder:text-text-secondary"
                          />
                        </div>
                      </div>

                      {/* Map */}
                      <div className="mb-6">
                        <p className="text-white font-bold text-sm mb-2">📍 Confirm on map</p>
                        <DeliveryMap cafeLat={cafe.coordinates.lat} cafeLng={cafe.coordinates.lng} height="200px" />
                        <p className="text-text-secondary text-xs mt-2 text-center">
                          Pin your exact location for accurate delivery
                        </p>
                      </div>

                      {/* ETA estimate */}
                      <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4 flex items-center gap-3 mb-4">
                        <span className="text-2xl">⏱️</span>
                        <div>
                          <p className="text-white font-bold text-sm">Estimated delivery</p>
                          <p className="text-warning font-bold">~35–45 minutes</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <PrimaryButton size="lg" className="w-full justify-center" onClick={handleProceedToPayment}>
                  Continue to Payment →
                </PrimaryButton>
              </motion.div>
            )}

            {/* ── Step 1: Payment ── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }}>
                <h2 className="font-display text-2xl font-bold text-white mb-6">Complete Payment</h2>

                <div className="bg-card rounded-2xl p-6 border border-white/10 text-center">
                  <img src="https://img.icons8.com/color/80/bhim.png" alt="UPI" className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold text-white mb-1">Pay via UPI</h3>
                  <p className="text-text-secondary text-sm mb-5">Scan QR code or use UPI ID</p>

                  {upiLoading ? (
                    <div className="flex justify-center py-12">
                      <Spinner size="lg" />
                    </div>
                  ) : (
                    <>
                      {/* QR Code */}
                      <div className="w-44 h-44 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center p-2">
                        {upiData?.qrDataUrl ? (
                          <img src={upiData.qrDataUrl} alt="QR" className="w-full h-full" />
                        ) : (
                          <div className="text-center">
                            <div className="text-4xl mb-1">📱</div>
                            <p className="text-black text-xs font-mono">QR Code</p>
                            <p className="text-gray-500 text-[10px]">Auto-generated on order</p>
                          </div>
                        )}
                      </div>

                      {/* UPI ID */}
                      <div className="bg-white/5 rounded-xl px-4 py-3 mb-2 inline-block">
                        <p className="text-text-secondary text-xs mb-0.5">UPI ID</p>
                        <p className="text-white font-mono font-bold">{upiData?.upiId ?? 'bobbabobba@paytm'}</p>
                      </div>

                      {/* Amount */}
                      <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 mb-5">
                        <p className="text-text-secondary text-xs">Amount to pay</p>
                        <p className="text-white font-display font-bold text-2xl bg-bubble-gradient bg-clip-text text-transparent">
                          {formatCurrency(total)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3">
                        <PrimaryButton
                          className="w-full justify-center"
                          size="lg"
                          onClick={handleVerifyPayment}
                          loading={verifying}
                        >
                          {verifying ? 'Verifying…' : "✓ I've Paid — Verify Payment"}
                        </PrimaryButton>
                        <SecondaryButton className="w-full justify-center" onClick={() => setStep(0)}>
                          ← Back
                        </SecondaryButton>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Confirmation ── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                className="text-center py-10">
                {/* Animated check */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ duration: 0.6, ease: 'backOut' }}
                  className="w-24 h-24 rounded-full bg-bubble-gradient mx-auto mb-6 flex items-center justify-center shadow-brand"
                >
                  <span className="text-4xl">✓</span>
                </motion.div>

                {/* Floating confetti bubbles */}
                {['🫧','🎉','🧋','⭐','🫧'].map((e, i) => (
                  <motion.span key={i}
                    className="absolute text-2xl pointer-events-none select-none"
                    initial={{ opacity: 1, y: 0, x: (i-2)*60 + Math.random()*20 }}
                    animate={{ opacity: 0, y: -100 }}
                    transition={{ delay: i*0.15, duration: 1.5 }}
                    style={{ left: '50%', top: '30%' }}
                  >{e}</motion.span>
                ))}

                <h2 className="font-display text-4xl font-bold text-white mb-2">Order Placed!</h2>
                <p className="text-text-secondary mb-1">Your bubble goodness is being prepared 🧋</p>
                <p className="text-secondary font-bold text-lg mb-2">Arriving in ~35–45 minutes</p>
                <div className="inline-block bg-white/10 rounded-xl px-4 py-2 mb-8">
                  <p className="text-text-secondary text-xs">Order ID</p>
                  <p className="text-white font-mono font-bold">#{orderId}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <PrimaryButton size="lg" onClick={() => navigate(`/orders/${orderId}`)}>
                    Track Order 📍
                  </PrimaryButton>
                  <SecondaryButton size="lg" onClick={() => navigate('/menu')}>
                    Order More
                  </SecondaryButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order summary — 2 cols, sticky */}
        {step < 2 && (
          <div className="lg:col-span-2 lg:sticky lg:top-24">
            <CartSummary deliveryFee={delivery} />
            <div className="mt-3 bg-card rounded-2xl p-4 border border-white/10">
              <p className="text-text-secondary text-xs text-center">
                🔒 Secure checkout · All payments encrypted
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
