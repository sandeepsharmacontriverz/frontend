'use client'

import React, { useRef, useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa'

export default function InputCode({ callback, reset, isLoading }:any) {
    const [code, setCode] = useState('');

    // Refs to control each digit input element
    const inputRefs:any = [
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
    ];

    // // Reset all inputs and clear state
    const resetCode = () => {
        inputRefs.forEach((ref:any) => {
            ref.current.value = '';
        });
        inputRefs[0].current.focus();
        setCode('');
        callback('')
    }

    // Call our callback when code = 6 chars
    useEffect(() => {
        if (code.length === 6) {
            if (typeof callback === 'function') callback(code);
        }
    }, [code]); 

    // // Listen for external reset toggle
    useEffect(() => {
        resetCode();
    }, [reset]); //eslint-disable-line

    // Handle input
    function handleInput(e:any, index:any) {
        const input = e.target;
        const previousInput:any = inputRefs[index - 1];
        const nextInput = inputRefs[index + 1];

        const newCode = [...code];
        if (/^[a-z]+$/.test(input.value)) {
            const uc = input.value.toUpperCase();
            newCode[index] = uc;
            inputRefs[index].current.value = uc;
        } else {
            newCode[index] = input.value;
        }
        setCode(newCode.join(''));

        input.select();

        if (input.value === '') {
            if (previousInput) {
                previousInput.current.focus();
            }
        } else if (nextInput) {
            nextInput.current.select();
        }
    }

    function handleFocus(e:any) {
        e.target.select();
    }

    function handleKeyDown(e:any, index:any) {
        const input = e.target;
        const previousInput:any = inputRefs[index - 1];
        const nextInput = inputRefs[index + 1];

        if ((e.keyCode === 8 || e.keyCode === 46) && input.value === '') {
            e.preventDefault();
            setCode((prevCode:any) => prevCode.slice(0, index) + prevCode.slice(index + 1));
            if (previousInput) {
                previousInput.current.focus();
            }
        }
    }

    const handlePaste = (e:any) => {
        const pastedCode = e.clipboardData.getData('text');
        if (pastedCode.length === 6) {
            setCode(pastedCode);
            inputRefs.forEach((inputRef:any, index:any) => {
                inputRef.current.value = pastedCode.charAt(index);
            });
        }
    };

    const ClearButton = () => {
        return (
            <button
                onClick={resetCode}
                className="text-xl absolute right-[-30px] top-3"
            >
                <FaTimes />
            </button>
        )
    }

    return (
        <div className="flex gap-2 relative justify-center">
            {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                    className="text-2xl bg-white w-10 flex p-2 text-center border-2"
                    key={index}
                    type="text"
                    maxLength={1}
                    onChange={(e) => handleInput(e, index)}
                    ref={inputRefs[index]}
                    autoFocus={index === 0}
                    onFocus={handleFocus}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    disabled={isLoading}
                />
            ))}
            {
                code.length
                    ?
                    <ClearButton />
                    :
                    <></>
            }
        </div>
    );
}