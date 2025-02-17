import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Search, Loader2, Copy, RefreshCw, Download, MessageCircle, Info, Zap } from 'lucide-react';
import axios from 'axios';
import type { BinResponse } from './types';
import { generateLuhn, generateRandomDigits, generateRandomMonth, generateRandomYear, generateRandomCVV, formatCardNumber } from './utils';

// Known Stripe BINs
const STRIPE_BINS = [
  { bin: '48478325827', type: 'Visa' },
  { bin: '5547182000', type: 'Mastercard' },
  { bin: '55791004117', type: 'Mastercard' },
  { bin: '4222823000', type: 'Visa' },
  { bin: '52281970004', type: 'Mastercard' },
  { bin: '35629746062', type: 'JCB' },
  { bin: '40276658', type: 'Visa' },
  { bin: '55790830137', type: 'Mastercard' },
  { bin: '55790701530', type: 'Mastercard' },
  { bin: '55790990127', type: 'Mastercard' },
  { bin: '4106210003', type: 'Visa' },
  { bin: '55490060010', type: 'Mastercard' },
  { bin: '55325300053', type: 'Mastercard' },
  { bin: '527522000', type: 'Mastercard' },
  { bin: '4628450067688', type: 'Visa' },
  { bin: '533187001', type: 'Mastercard' },
  { bin: '4312316013', type: 'Visa' },
  { bin: '4680056032', type: 'Visa' },
  { bin: '47505561204', type: 'Visa' }
];

// Create axios instance with CORS handling and timeout
const api = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

function App() {
  const [bin, setBin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [binData, setBinData] = useState<BinResponse | null>(null);
  const [showStripeBins, setShowStripeBins] = useState(false);
  
  // Card generator state
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [quantity, setQuantity] = useState<number>(10);
  const [generatedCards, setGeneratedCards] = useState<string[]>([]);

  const quantityOptions = [10, 50, 100, 200, 300, 400, 500];
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 16 }, (_, i) => String(currentYear + i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bin.length !== 6) {
      setError('Please enter a valid 6-digit BIN');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://lookup.binlist.net/${bin}`)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch BIN data. Please try again later.');
      }
      
      const data = await response.json();
      setBinData({
        scheme: data.scheme || 'Unknown',
        type: data.type || 'Unknown',
        country: {
          name: data.country?.name || 'Unknown',
          emoji: data.country?.emoji || '',
          alpha2: data.country?.alpha2 || ''
        },
        bank: {
          name: data.bank?.name || 'Unknown'
        }
      });
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateCards = useCallback(() => {
    if (bin.length !== 14) {
      setError('Please enter a valid 6-digit BIN first');
      return;
    }

    if (cvv && cvv.length !== 3) {
      setError('CVV must be 3 digits');
      return;
    }

    const cards: string[] = [];
    for (let i = 0; i < quantity; i++) {
      const remainingLength = 15 - bin.length;
      const cardNumber = bin + generateRandomDigits(remainingLength);
      const validCardNumber = generateLuhn(cardNumber);
      const cardMonth = month || generateRandomMonth();
      const cardYear = year || generateRandomYear();
      const cardCVV = cvv || generateRandomCVV();
      cards.push(`${validCardNumber}|${cardMonth}|${cardYear}|${cardCVV}`);
    }
    setGeneratedCards(cards);
  }, [bin, month, year, cvv, quantity]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const copyAllCards = useCallback(() => {
    const allCards = generatedCards.join('\n');
    navigator.clipboard.writeText(allCards);
  }, [generatedCards]);

  const downloadCards = useCallback(() => {
    const content = generatedCards.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated_cards_${bin}_${quantity}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generatedCards, bin, quantity]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      {/* Animated Header */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-12"
      >
        <motion.div
          className="inline-flex items-center gap-3 mb-4"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Zap size={48} className="text-yellow-400" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-transparent bg-clip-text">
            JaxxLookup
          </h1>
          <Zap size={48} className="text-yellow-400" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 text-lg"
        >
          Advanced BIN Lookup & Card Generator Tool
        </motion.p>
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BIN Lookup Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/90 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700"
        >
          <div className="flex flex-col items-center justify-center mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mb-4"
            >
              <CreditCard size={48} className="text-cyan-400" />
            </motion.div>
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text mb-2">
                BIN Lookup
              </h1>
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg font-medium text-gray-400"
              >
                <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-transparent bg-clip-text">
                  JaxxLookup
                </span>
                <span className="mx-2">•</span>
                <span>Lookup Service</span>
              </motion.div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={bin}
                onChange={(e) => setBin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit BIN"
                className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition-all placeholder-gray-500"
                maxLength={6}
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-cyan-500 text-gray-900 p-2 rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Search />}
              </button>
            </div>
          </form>

          <button
            onClick={() => setShowStripeBins(!showStripeBins)}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Info size={18} />
            {showStripeBins ? 'Hide' : 'Show'} Stripe BINs
          </button>

          {showStripeBins && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2"
            >
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-100 mb-3">Known Stripe BINs</h3>
                <div className="grid grid-cols-2 gap-2">
                  {STRIPE_BINS.map((stripeBin) => (
                    <div
                      key={stripeBin.bin}
                      className="p-2 bg-gray-800 rounded border border-gray-700 text-sm"
                    >
                      <div className="font-mono text-gray-300">{stripeBin.bin}</div>
                      <div className="text-gray-400 text-xs">{stripeBin.type}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="bin-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-3 bg-red-900/50 text-red-200 rounded-lg border border-red-700"
              >
                {error}
              </motion.div>
            )}

            {binData && (
              <motion.div
                key="bin-data"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <InfoCard title="Brand" value={binData.scheme} />
                  <InfoCard title="Type" value={binData.type} />
                  <InfoCard 
                    title="Country" 
                    value={
                      <div className="flex items-center gap-2">
                        {binData.country.alpha2 && (
                          <img 
                            src={`https://flagcdn.com/w40/${binData.country.alpha2.toLowerCase()}.png`}
                            alt={`${binData.country.name} flag`}
                            className="w-6 h-4 object-cover rounded"
                          />
                        )}
                        <span>{binData.country.name} {binData.country.emoji}</span>
                      </div>
                    } 
                  />
                  <InfoCard title="Bank" value={binData.bank.name} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Card Generator Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/90 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700"
        >
          <div className="flex flex-col items-center justify-center mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mb-4"
            >
              <RefreshCw size={48} className="text-purple-400" />
            </motion.div>
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text mb-2">
                Generator
              </h1>
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg font-medium text-gray-400"
              >
                <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-transparent bg-clip-text">
                  JaxxLookup
                </span>
                <span className="mx-2">•</span>
                <span>Card Generator</span>
              </motion.div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <input
                type="text"
                value={bin}
                onChange={(e) => setBin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit BIN"
                className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all placeholder-gray-500"
                maxLength={6}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none appearance-none"
                >
                  <option value="">Random</option>
                  {months.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none appearance-none"
                >
                  <option value="">Random</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">CVV</label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                    setCvv(value);
                  }}
                  placeholder="CVV"
                  className="w-full px-3 py-2 rounded bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none placeholder-gray-500"
                  maxLength={3}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quantity to Generate
              </label>
              <div className="grid grid-cols-4 gap-2">
                {quantityOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setQuantity(option)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      quantity === option
                        ? 'bg-purple-500 text-gray-900'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateCards}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-gray-900 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-medium"
            >
              <RefreshCw size={18} />
              Generate {quantity} Cards
            </button>

            {generatedCards.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-100">
                    Generated Cards ({generatedCards.length})
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={copyAllCards}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <Copy size={18} />
                      Copy All
                    </button>
                    <button
                      onClick={downloadCards}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <Download size={18} />
                      Download
                    </button>
                  </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto space-y-2 bg-gray-900/50 rounded-lg p-4">
                  {generatedCards.map((card, index) => (
                    <motion.div
                      key={`card-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="flex justify-between items-center bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-700"
                    >
                      <code className="font-mono text-sm text-gray-300">{card}</code>
                      <button
                        onClick={() => copyToClipboard(card)}
                        className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-gray-300"
                        title="Copy card details"
                      >
                        <Copy size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Contact Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mt-6"
      >
        <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-gray-700">
          <div className="flex items-center justify-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <MessageCircle size={32} className="text-cyan-400" />
            </motion.div>
            <a
              href="https://t.me/j1xxy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text hover:opacity-80 transition-opacity"
            >
              Contact me on Telegram @j1xxy
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value: string | React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-900/50 rounded-lg p-4 shadow-md border border-gray-700"
    >
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <div className="text-lg font-semibold text-gray-100 mt-1">{value}</div>
    </motion.div>
  );
}

export default App;
