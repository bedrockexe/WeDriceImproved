"use client"
import React from 'react'
import { motion } from 'framer-motion'

const FormField = ({
    label,
    name,
    register,
    error,
    type,
    placeholder,
}) => {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <div className="mt-1">
                <motion.input
                    whileFocus={{ scale: 1.01 }}
                    id={name}
                    type={type}
                    placeholder={placeholder}
                    {...(register ? register(name) : {})}
                    className={`appearance-none block w-full px-3 py-2 border ${error ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all`}
                />
            </div>
            {error && (
                <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 text-sm text-red-600"
                >
                    {error}
                </motion.p>
            )}
        </div>
    )
}

export default FormField
