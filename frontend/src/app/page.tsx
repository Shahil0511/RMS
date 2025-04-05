"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, LogIn, UserPlus, Utensils, Clock, CheckCircle, Smartphone, BarChart, XCircle } from "lucide-react"

export default function Home() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [activeAuthForm, setActiveAuthForm] = useState<"login" | "signup">("login")

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Utensils className="h-8 w-8 text-amber-500" />
          <h1 className="text-2xl font-bold">PioneerPOS</h1>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-amber-300' : 'bg-gray-200 text-gray-700'}`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <div className="hidden md:flex space-x-2">
            <button
              onClick={() => {
                setActiveAuthForm("login")
                setShowLogin(true)
                setShowSignup(false)
              }}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${theme === 'dark' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-amber-500 hover:bg-amber-600'} text-white`}
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </button>
            <button
              onClick={() => {
                setActiveAuthForm("signup")
                setShowSignup(true)
                setShowLogin(false)
              }}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              <UserPlus className="h-4 w-4" />
              <span>Sign Up</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-10 md:py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2 space-y-8">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Modern POS System for <span className="text-amber-500">Restaurants</span>
            </h1>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Streamline your restaurant operations with our intuitive point of sale system.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setActiveAuthForm("login")
                  setShowLogin(true)
                  setShowSignup(false)
                }}
                className={`px-6 py-3 rounded-lg flex items-center justify-center space-x-2 ${theme === 'dark' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-amber-500 hover:bg-amber-600'} text-white`}
              >
                <LogIn className="h-5 w-5" />
                <span className="font-medium">Get Started</span>
              </button>
              <button
                onClick={() => {
                  setActiveAuthForm("signup")
                  setShowSignup(true)
                  setShowLogin(false)
                }}
                className={`px-6 py-3 rounded-lg flex items-center justify-center space-x-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                <UserPlus className="h-5 w-5" />
                <span className="font-medium">Create Account</span>
              </button>
            </div>
          </div>

          <div className="md:w-1/2">
            <div className={`rounded-2xl overflow-hidden shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`p-4 flex items-center space-x-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg">Order #142</h3>
                  <div className="flex items-center space-x-1 text-sm text-amber-500">
                    <Clock className="h-4 w-4" />
                    <span>12:34 PM</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span>Margherita Pizza</span>
                    <span>$12.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Caesar Salad</span>
                    <span>$8.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Garlic Bread</span>
                    <span>$4.99</span>
                  </div>
                </div>

                <div className={`border-t pt-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>$26.97</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className={`py-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-md`}>
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 text-amber-600 mb-4">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mobile Friendly</h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                Access your POS from any device, anywhere.
              </p>
            </div>

            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-md`}>
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 mb-4">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                Intuitive interface designed for quick training.
              </p>
            </div>

            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-md`}>
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                <BarChart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                Track sales and make informed decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Authentication Modal */}
      {(showLogin || showSignup) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md rounded-xl shadow-2xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-4 flex justify-between items-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className="font-bold text-lg">
                {activeAuthForm === "login" ? "Login to Your Account" : "Create an Account"}
              </h3>
              <button
                onClick={() => {
                  setShowLogin(false)
                  setShowSignup(false)
                }}
                className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit}>
                {activeAuthForm === "signup" && (
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      required
                    />
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    required
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="password" className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 rounded-lg flex items-center justify-center space-x-2 ${theme === 'dark' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-amber-500 hover:bg-amber-600'} text-white font-medium`}
                >
                  {activeAuthForm === "login" ? (
                    <>
                      <LogIn className="h-5 w-5" />
                      <span>Login</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5" />
                      <span>Sign Up</span>
                    </>
                  )}
                </button>
              </form>

              <div className={`mt-4 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {activeAuthForm === "login" ? (
                  <p>
                    Don't have an account?{' '}
                    <button
                      onClick={() => setActiveAuthForm("signup")}
                      className="text-amber-500 hover:underline"
                    >
                      Sign up
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      onClick={() => setActiveAuthForm("login")}
                      className="text-amber-500 hover:underline"
                    >
                      Login
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`py-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="container mx-auto px-4 text-center">
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            © {new Date().getFullYear()} PionerPOS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}