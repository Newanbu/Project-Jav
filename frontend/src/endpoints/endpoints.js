import axios from "axios";
import Swal from "sweetalert2";

const BASE_URL = "http://localhost:8000";
const LOGIN_URL = `${BASE_URL}/api/token/`;
const EQUIPOS_URL = `${BASE_URL}/api/equipos/`;
const RASPADORES_URL = `${BASE_URL}/api/raspadores/`;
const CATEGORIA_URL = `${BASE_URL}/api/categorias/`;
const LOGOUT_URL = `${BASE_URL}/api/logout/`;

// 🔹 Login con manejo de credenciales
export const login = async (email, password) => {
    try {
        await axios.post(
            LOGIN_URL,
            { email: email, password: password },
            {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};


export const logout = async () => {
    try {
        const response = await axios.post(LOGOUT_URL,{}, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        });
        return true;
    } catch (error) {
        console.error("❌ Error al hacer logout:", error.response?.data || error.message);
        return false;
    }
}

// 🔹 Obtener Categorías
export const getCategorias = async () => {
    try {
        const response = await axios.get(CATEGORIA_URL, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error("❌ Error al obtener categorías:", error.response?.data || error.message);
        return [];
    }
};


export const addCategoriaTag = async (nombre) => {
    try {
        const response = await axios.post(CATEGORIA_URL, {nombre:nombre}, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }catch(error){
        console.error("❌ Error al agregar categoría:", error.response?.data || error.message);
        throw error;
    }
}

export const addCategoria = async (tag, categoria) => {
    try {
        const response = await axios.post(EQUIPOS_URL, {tag_estandar:tag, categoria:categoria}, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        });

        return response.data;
    } catch (error) {
        console.error("❌ Error al agregar categoría:", error.response?.data || error.message);
        throw error;
    }
}


export const getEquipos = async () => {
    try {
        const response = await axios.get(EQUIPOS_URL, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        });
     return response.data
    } catch (error) {
        console.error("❌ Error al obtener equipos:", error.response?.data || error.message);
        return [];
    }
};

// 🔹 Obtener Raspadores (Filtrar por Equipo si se pasa un ID)
export const getRaspadores = async (equipoId = null) => {
    try {
        let url = RASPADORES_URL;
        if (equipoId !== null && !isNaN(equipoId)) {
            url += `?equipo_id=${equipoId}`;
        }

        const response = await axios.get(url, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error("❌ Error al obtener raspadores:", error.response?.data || error.message);
        return [];
    }
};


export const addRaspador = async (
    equipo,
    raspador,
    dias_vida_util_disponible,
    porcentaje_vida_util_disponible,
    accion,
    estatus,
    fecha_ultimo_cambio,
    ciclo_hoja,
    proximo_cambio
) => {
    try {
        const response = await axios.post(
            RASPADORES_URL,
            {
                equipo: equipo,
                raspador: raspador,
                dias_vida_util_disponible: dias_vida_util_disponible,
                porcentaje_vida_util_disponible: porcentaje_vida_util_disponible,
                accion: accion,
                estatus: estatus,
                fecha_ultimo_cambio: fecha_ultimo_cambio,
                ciclo_hoja: ciclo_hoja,
                proximo_cambio: proximo_cambio
            },
            {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        if (response.status === 201 || response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('❌ Error al agregar raspador:', error.response?.data || error.message);
        throw error;
    }
};


export const addEquipo = async (tag_estandar,categoria) => {
    try {
        const response = await axios.post(EQUIPOS_URL, {tag_estandar:tag_estandar, categoria:categoria}, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        });

        return response.data;
    } catch (error) {
        console.error("❌ Error al agregar equipo:", error.response?.data || error.message);
        throw error;
    }
};

export const updateEquipo = async (id, equipoData) => {
    try {
        const response = await axios.patch(`${RASPADORES_URL}${id}/`, equipoData, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        });

        return response.data;
    } catch (error) {
        console.error("❌ Error al actualizar equipo:", error.response?.data || error.message);
        throw error;
    }
}


export const info_raspador = async (id) => {
    try {
        if (!id) {
            throw new Error("❌ Error: Se intentó obtener información con un ID inválido.");
        }

        const response = await axios.get(`${RASPADORES_URL}${id}`, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.data || Object.keys(response.data).length === 0) {
            throw new Error("❌ La API devolvió una respuesta vacía.");
        }

        return response.data;

    } catch (error) {
        
        // Si la API devuelve un error 404 o 500, mostrar mensaje claro
        if (error.response) {
            const { status } = error.response;
            if (status === 404) {
                console.warn("⚠️ Advertencia: No se encontró información para el ID solicitado.");
            } else if (status === 401) {
                console.warn("🔐 Error de autenticación: No tienes permisos para acceder a estos datos.");
            } else if (status === 500) {
                console.warn("🔥 Error del servidor: Hay un problema en el backend.");
            }
        }

        return null; // Devolver `null` en lugar de `[]` para evitar mostrar listas vacías.
    }
};



export const deleteEquipo = async (id) => {
    const url = `${RASPADORES_URL}${id}/`;
    try {
        const response = await axios.delete(url, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        });

        return true;
    } catch (error) {
        console.error("❌ Error al eliminar equipo:", error.response?.data || error.message);
        return false;
    }

}