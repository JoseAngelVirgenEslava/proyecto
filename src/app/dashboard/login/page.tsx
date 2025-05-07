'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Enviando datos:", email, password)
    const res = await fetch(`/api/${isLogin ? 'login' : 'register'}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
    console.log("Respuesta recibida:", res.status)
    if (res.ok) {
      console.log("Exito! --", res)
      setErrorMessage('')
      router.push('/dashboard/main')
    } else {
      console.log("Fracaso! --", res)
      if (res.status === 409) {
        setErrorMessage('Este correo electrónico ya está registrado.')
        setTimeout(() => {
          setErrorMessage('')
          setEmail('')
          setPassword('')
        }, 5000)
      } else {
        setErrorMessage('Ocurrió un error. Intenta de nuevo.')
        setTimeout(() => {
          setErrorMessage('')
          setEmail('')
          setPassword('')
        }, 5000)
      }
    }
  }
  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="mx-auto h-10 w-auto"
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
          alt="Your Company"
        />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {errorMessage && (
          <div className="mb-4 text-sm text-red-600 font-medium text-center">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm 
                           ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 
                           focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm 
                           ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 
                           focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 
                         text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 
                         focus-visible:outline-indigo-600"
            >
              {isLogin ? 'Sign in' : 'Register'}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          {isLogin ? 'Not a member?' : 'Already have an account?'}{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setEmail('')
              setPassword('')
              setErrorMessage('')
            }}
            className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >
            {isLogin ? 'Create account' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  )
}