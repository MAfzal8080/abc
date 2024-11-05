import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { stateProps, StoreProducts } from '../../type';
import { SiMediamarkt } from 'react-icons/si';
import FormatedPrice from './FormatedPrice';
import { loadStripe } from '@stripe/stripe-js'
import { useSession } from 'next-auth/react';

const CardPayment = () => {
    const { productData, userInfo } = useSelector((state: stateProps) => state.next);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        let amount = 0;
        productData.map((item: StoreProducts) => {
            amount += item.price * 10 * item.quantity;
            return
        })
        setTotalAmount(amount)
    }, [productData]);

    const stripePromise = loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    )

    const {data:session} = useSession();
    const handleCheckout = async()=>{
        const stripe = await stripePromise
        const response = await fetch("api/checkout",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({items:productData, email:session?.user?.email})
        })
        const checkoutSession = await response.json()
        const result: any = await stripe?.redirectToCheckout({
            sessionId: checkoutSession.id,
          });
          if (result.error) {
            alert(result?.error.message);
          } 
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-2">
                <span className="bg-green-600 rounded-full p-1 h-6 w-6 text-sm
                 text-white flex items-center justify-center mt-1">
                    <SiMediamarkt />
                </span>
                <p className="text-sm">Your order qualifies for FREE Shipping. Continue for more Details</p>
            </div>

            <p className="flex items-center justify-between px-2 font-semibold">Total Price: {" "}
                <span className="font-bold text-xl">
                    <FormatedPrice amount={totalAmount} />
                </span>
            </p>
            {
                userInfo ? (
                    <div className="flex flex-col items-center">
                        <button onClick={handleCheckout} className="w-full h-10 text-sm font-semibold bg-amazon_yellow  text-black rounded-lg hover:bg-amazon_blue hover:text-white duration-300">
                            Proceed to Checkout
                        </button>

                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <button className="w-full h-10 text-sm font-semibold bg-amazon_blue bg-opacity-50 text-white rounded-lg cursor-not-allowed">
                            Proceed to Checkout
                        </button>
                    </div>
                )
            }

        </div>
    )
}

export default CardPayment