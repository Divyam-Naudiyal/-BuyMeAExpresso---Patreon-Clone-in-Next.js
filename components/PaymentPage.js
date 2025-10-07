"use client"
import React, { useEffect, useState } from 'react'
import Script from 'next/script'
import { fetchuser, fetchpayments } from '@/actions/useractions'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

const PaymentPage = ({ username }) => {
    const [paymentform, setPaymentform] = useState({name: "", message: "", amount: ""})
    const [currentUser, setcurrentUser] = useState({})
    const [payments, setPayments] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [toastMessage, setToastMessage] = useState("")
    const [showToast, setShowToast] = useState(false)
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        getData()
    }, [])

    useEffect(() => {
        if(searchParams.get("paymentdone") == "true"){
            showCustomToast('🎉 Thanks for your donation!', 'success')
        }
    }, [searchParams])

    const showCustomToast = (message, type = 'info') => {
        setToastMessage(message)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 5000)
    }
    

    const handleChange = (e) => {
        setPaymentform({ ...paymentform, [e.target.name]: e.target.value })
    }

    const getData = async () => {
        try {
            let u = await fetchuser(username)
            setcurrentUser(u)
            let dbpayments = await fetchpayments(username)
            setPayments(dbpayments) 
        } catch (error) {
            console.error('Error fetching data:', error)
            showCustomToast('Error loading data', 'error')
        }
    }

    // Demo payment function that simulates UPI payment
    const payWithUPI = async (amountInRupees) => {
        if (!paymentform.name || paymentform.name.length < 2) {
            showCustomToast('Please enter your name', 'error')
            return;
        }

        if (!amountInRupees && !paymentform.amount) {
            showCustomToast('Please enter an amount', 'error')
            return;
        }

        const amount = amountInRupees || parseInt(paymentform.amount);
        
        if (amount < 1) {
            showCustomToast('Please enter a valid amount', 'error')
            return;
        }

        setIsLoading(true);
        
        try {
            // Show demo UPI interface
            showDemoUPIInterface(amount);
            
        } catch (error) {
            showCustomToast('Payment failed. Please try again.', 'error')
            console.error('Payment error:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const showDemoUPIInterface = (amount) => {
        // Create demo UPI modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-6 w-96 max-w-md mx-4">
                <div class="text-center mb-4">
                    <h3 class="text-xl font-bold text-gray-800">Buy Me A Expresso</h3>
                    <p class="text-gray-600">Pay with UPI</p>
                </div>
                
                <div class="bg-gray-100 rounded-lg p-4 text-center mb-4">
                    <div class="text-2xl font-bold text-green-600">₹${amount}</div>
                    <p class="text-sm text-gray-600">Amount to pay</p>
                </div>
                
                <div class="text-center mb-4">
                    <div class="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                        <div class="text-4xl mb-2">📱</div>
                        <p class="text-sm text-gray-600">Scan QR with any UPI app</p>
                        <div class="text-xs text-gray-500 mt-2">Demo QR Code</div>
                    </div>
                </div>
                
                <div class="bg-blue-50 rounded-lg p-3 mb-4">
                    <p class="text-sm text-blue-800 text-center">
                        💡 This is a demo payment interface
                    </p>
                </div>
                
                <div class="grid grid-cols-2 gap-3">
                    <button id="cancelPayment" class="bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition duration-200">
                        Cancel
                    </button>
                    <button id="confirmPayment" class="bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-200">
                        Pay Now
                    </button>
                </div>
                
                <div class="mt-4 text-center">
                    <p class="text-xs text-gray-500">Payment will be processed securely</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle payment confirmation
        modal.querySelector('#confirmPayment').onclick = () => {
            document.body.removeChild(modal);
            processDemoPayment(amount);
        };

        // Handle cancellation
        modal.querySelector('#cancelPayment').onclick = () => {
            document.body.removeChild(modal);
            showCustomToast('Payment cancelled', 'info');
        };
    }

    const processDemoPayment = (amount) => {
        // Simulate payment processing
        setIsLoading(true);
        
        setTimeout(() => {
            // Create new payment record
            const newPayment = {
                id: Date.now(),
                name: paymentform.name,
                amount: amount,
                message: paymentform.message || "Thanks for your work! ☕",
                timestamp: new Date().toISOString(),
                status: 'completed'
            };

            // Update payments state
            setPayments(prev => [newPayment, ...prev]);
            
            // Reset form
            setPaymentform({ name: "", message: "", amount: "" });
            
            // Show success message
            showCustomToast(`🎉 Payment successful! Thank you for ₹${amount}`, 'success');
            
            setIsLoading(false);
        }, 2000);
    }

    const quickPay = (amountInRupees) => {
        if (!paymentform.name || paymentform.name.length < 2) {
            showCustomToast('Please enter your name first', 'error')
            return;
        }
        payWithUPI(amountInRupees);
    }

    // Calculate total raised
    const totalRaised = payments.reduce((sum, payment) => sum + payment.amount, 0);

    return (
        <>
            {/* Custom Toast Notification */}
            {showToast && (
                <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-right duration-300">
                    {toastMessage}
                </div>
            )}
            
            {/* Header Section - Blue Theme */}
            <div className='cover w-full bg-gradient-to-r from-blue-500 to-blue-700 relative'>
                <div className='w-full h-48 md:h-[300px] bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center'>
                    <div className='text-center text-white'>
                        <h1 className='text-4xl md:text-6xl font-bold mb-4'>☕</h1>
                        <p className='text-xl md:text-2xl font-semibold'>Buy Me A Expresso</p>
                        <p className='text-lg opacity-90'>Support {username}'s creative work</p>
                    </div>
                </div>
                <div className='absolute -bottom-16 left-1/2 transform -translate-x-1/2 border-4 border-white overflow-hidden rounded-full size-32 bg-white'>
                    <img 
                        className='rounded-full object-cover size-32' 
                        src={currentUser.profilepic || "/default-avatar.png"} 
                        alt={username} 
                    />
                </div>
            </div>

            {/* User Info */}
            <div className="info flex justify-center items-center mt-20 mb-8 flex-col gap-2 text-center">
                <div className='font-bold text-2xl text-gray-800'>
                    @{username}
                </div>
                <div className='text-gray-600 text-lg max-w-md'>
                    Help me stay energized and create more amazing content! ☕
                </div>
                <div className='text-gray-500 flex gap-4'>
                    <span>❤️ {payments.length} Supporters</span>
                    <span>💰 ₹{totalRaised} Raised</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 max-w-6xl mb-16">
                <div className="payment flex gap-8 flex-col lg:flex-row">
                    
                    {/* Supporters List */}
                    <div className="supporters w-full lg:w-2/5 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <h2 className='text-2xl font-bold text-gray-800 mb-6'>Recent Supporters 🎉</h2>
                        <div className='space-y-4 max-h-96 overflow-y-auto'>
                            {payments.length === 0 ? (
                                <div className='text-center text-gray-500 py-8'>
                                    <div className='text-4xl mb-2'>☕</div>
                                    <p>Be the first to support {username}!</p>
                                    <p className='text-sm text-gray-400 mt-2'>Demo payments will appear here</p>
                                </div>
                            ) : (
                                payments.map((p, i) => (
                                    <div key={p.id || i} className='flex items-center gap-4 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition duration-200'>
                                        <div className='flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold'>
                                            {p.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div className='flex-1'>
                                            <div className='font-semibold text-gray-800'>{p.name || 'Anonymous'}</div>
                                            <div className='text-sm text-gray-600'>{p.message || 'Thank you!'}</div>
                                            <div className='text-xs text-gray-400 mt-1'>
                                                {new Date(p.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className='text-lg font-bold text-green-600'>
                                            ₹{p.amount}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Payment Form */}
                    <div className="makePayment w-full lg:w-3/5 bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                        <h2 className='text-2xl font-bold text-gray-800 mb-2'>Buy me an expresso ☕</h2>
                        <p className='text-gray-600 mb-6'>Your support helps me create more amazing content!</p>
                        
                        {/* UPI Payment Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">📱</div>
                                <div>
                                    <h3 className="font-semibold text-blue-800">Pay with UPI</h3>
                                    <p className="text-sm text-blue-600">Fast & secure payment via UPI QR Code</p>
                                    <p className="text-xs text-blue-500 mt-1">💡 Demo mode - no real payment</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Quick Amount Buttons */}
                        <div className='mb-6'>
                            <h3 className='font-semibold text-gray-700 mb-3'>Quick support:</h3>
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                                <button 
                                    className='bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl transition duration-300 font-semibold disabled:opacity-50'
                                    onClick={() => quickPay(50)}
                                    disabled={isLoading}
                                >
                                    ₹50
                                </button>
                                <button 
                                    className='bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl transition duration-300 font-semibold disabled:opacity-50'
                                    onClick={() => quickPay(100)}
                                    disabled={isLoading}
                                >
                                    ₹100
                                </button>
                                <button 
                                    className='bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl transition duration-300 font-semibold disabled:opacity-50'
                                    onClick={() => quickPay(200)}
                                    disabled={isLoading}
                                >
                                    ₹200
                                </button>
                                <button 
                                    className='bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl transition duration-300 font-semibold disabled:opacity-50'
                                    onClick={() => quickPay(500)}
                                    disabled={isLoading}
                                >
                                    ₹500
                                </button>
                            </div>
                        </div>

                        {/* Custom Amount Form */}
                        <div className='space-y-4'>
                            <h3 className='font-semibold text-gray-700'>Or custom amount:</h3>
                            
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Your Name *</label>
                                    <input
                                        onChange={handleChange}
                                        value={paymentform.name}
                                        name='name'
                                        type="text"
                                        className='w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800 caret-blue-500'
                                        placeholder='Enter your name'
                                        disabled={isLoading}
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Amount (₹) *</label>
                                    <input
                                        onChange={handleChange}
                                        value={paymentform.amount}
                                        name="amount"
                                        type="number"
                                        className='w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800 caret-blue-500'
                                        placeholder='Enter amount'
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Message (Optional)</label>
                                <textarea
                                    onChange={handleChange}
                                    value={paymentform.message}
                                    name='message'
                                    rows="3"
                                    className='w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800 caret-blue-500'
                                    placeholder='Leave an encouraging message...'
                                    disabled={isLoading}
                                />
                            </div>

                            <button
                                onClick={() => payWithUPI()}
                                disabled={isLoading || !paymentform.name || paymentform.name.length < 2 || !paymentform.amount}
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <span>📱</span>
                                        Pay with UPI
                                    </>
                                )}
                            </button>
                            
                            <p className="text-center text-sm text-gray-500">
                                💡 Demo mode - No real payment will be processed
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PaymentPage