import React, { useState } from "react";
import { login } from "../endpoints/endpoints";
import Swal from "sweetalert2"
import { useNavigate } from "react-router-dom";

const Login = () => {

    // Estados
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const handleShowClick = () => setShowPassword(!showPassword);
    const nav = useNavigate()

    // Funciones para login

    const handleLogin = async()=>{
        const response = await login(email,password)
        if(response){
            Swal.fire({
                icon:'success',
                title:'Bienvenido!',
                text:'Inicio de sesión correcto',
                confirmButtonText:'Aceptar'
            })
            nav('/menu')

        }
        console.log(response)
    }

    return(
        <>
            <div className="flex justify-center items-center h-screen bg-zinc-100 px-4">
                <div className="flex flex-col md:flex-row  rounded-lg text-black shadow-xl font-bold w-full max-w-4xl overflow-hidden">
                    {/* Columna Izquierda: Imagen */}
                    <div className="w-full md:w-1/2 flex justify-center items-center  p-6">
                        <img 
                            src="./EsteMejor.png" 
                            alt="Logo" 
                            className="w-64 h-64 object-contain"
                        />
                    </div>
                    {/* Columna Derecha: Formulario */}
                    <div className="w-full md:w-1/2 p-10 flex flex-col gap-6">
                        {/* Título */}
                        <h1 className="text-3xl mb-4 text-center md:text-left">Inicio de Sesión</h1>

                        {/* Formulario */}
                        <form className="flex flex-col gap-4">
                            {/* Campo Email */}
                            <label htmlFor="email" className="text-black">Email</label>
                            <input 
                                className="border border-gray-300 p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-400" 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value.trim())} 
                            />

                            {/* Campo Contraseña */}
                            <label htmlFor="password" className="text-black">Contraseña</label>
                            <input 
                                className="border border-gray-300 p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-400" 
                                type={showPassword ? 'text' : 'password'} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value.trim())} 
                            />

                            {/* Botón Mostrar Contraseña */}
                            <button 
                                type="button" 
                                className="bg-green-100 text-black font-bold hover:bg-green-200 transition p-3 rounded-lg"
                                onClick={handleShowClick}
                            >
                                {showPassword ? "Ocultar Contraseña" : "Mostrar Contraseña"}
                            </button>

                            {/* Botón Iniciar Sesión */}
                            <button 
                                type="button" 
                                className="bg-green-500 text-black font-bold hover:bg-green-600 transition p-3 rounded-lg"
                                onClick={handleLogin}
                            >
                                Iniciar Sesión
                            </button>
                        </form>
                    </div>
                </div>
            </div>


        </>
    )
}

export default Login;









