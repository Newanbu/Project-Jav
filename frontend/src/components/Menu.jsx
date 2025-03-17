import React, { useEffect, useState } from "react";
import { getCategorias, getEquipos, getRaspadores ,updateEquipo, logout,addRaspador,deleteEquipo, addCategoria, addCategoriaTag} from "../endpoints/endpoints";
import Swal from "sweetalert2";
import {useNavigate} from "react-router-dom";
const Menu = () => {
  const [categorias, setCategorias] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [raspadores, setRaspadores] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(""); 
  const nav = useNavigate();
  const [showEditEquipoModal, setShowEditModal] = useState(false);
  const [showAddEquipo, setShowAddEquipo] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null)
  const [showRaspadorModal, setShowRaspadorModal] = useState(false);
  const [showCatTagModal, setShowCatTagModal] = useState(false);
  const [newRaspador, setNewRaspador] = useState({
      equipo: "",
      raspador: "",
      dias_vida_util_disponible: "",
      porcentaje_vida_util_disponible: "",
      accion: "",
      estatus: "",
      fecha_ultimo_cambio: "",
      ciclo_hoja: "",
      proximo_cambio: "",
  });
  const [tagSeleccionado, setTagSeleccionado] = useState({
    categoria: "",
    tag_estandar: "",
});

const [categoriaTagSeleccionado, setcategoriaTagSeleccionado] = useState({
    nombre: "",
});



  // 🔹 Obtener datos desde la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriasData = await getCategorias();
        setCategorias(categoriasData);
  
        const equiposData = await getEquipos();
        setEquipos(equiposData);

        const raspadoresData = await getRaspadores();
        setRaspadores(raspadoresData);
      } catch (error) {
        console.error("❌ Error al obtener los datos:", error);
      }
    };
  
    fetchData();
  }, []);

// 📌 Función para manejar cambios en los inputs
const handleChange = (e) => {
    const { name, value } = e.target;
    setTagSeleccionado((prev) => ({
        ...prev,
        [name]: value,
    }));
};


const handleChangeCat = (e) => {
    const { name, value } = e.target;
    setcategoriaTagSeleccionado((prev) => ({
        ...prev,
        [name]: value,
    }));
};


const openRaspadorModal = () => setShowRaspadorModal(true);
const closeRaspadorModal = () => setShowRaspadorModal(false);


const openCategoriaTagModal = () => setShowCatTagModal(true);
const closeCategoriaTagModal = () => setShowCatTagModal(false);
  
  
const handleDeleteRas = async (id) => {
  await deleteEquipo(id)
  Swal.fire({
    title:"Raspador eliminado",
    text:"raspador eliminado correctamente",
    icon:"success",
    confirmButtonText:"Aceptar"
  })
  const getras = await getRaspadores()
  setRaspadores(getras)
}

const handleAddTag = async () => {
    if (!tagSeleccionado.categoria || !tagSeleccionado.tag_estandar) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Debes seleccionar una categoría y un TAG del equipo.",
            confirmButtonText: "Aceptar",
        });
        return;
    }

    try {
        await addCategoria(tagSeleccionado.tag_estandar, tagSeleccionado.categoria);
        Swal.fire({
            icon: "success",
            title: "Equipo agregado",
            text: "El equipo fue agregado correctamente.",
            confirmButtonText: "Aceptar",
        });
        window.location.reload()
        closeAddEquipoModal();
        
    }catch(error){
        Swal.fire({
            icon:"error",
            title:"Error",
            text:error.response?.data?.detail || "Hubo un problema al agregar el equipo",
            confirmButtonText:"Aceptar"
        })
    }

}


const calcularVidaUtil = (proximoCambio, cicloHoja) => {
  const hoy = new Date(); // 📌 Fecha actual
  const fechaCambio = new Date(proximoCambio); // 📌 Fecha de próximo cambio

  if (isNaN(fechaCambio) || !proximoCambio) return { diasRestantes: "", porcentajeVidaUtil: "" };

  const diasRestantes = Math.ceil((fechaCambio - hoy) / (1000 * 3600 * 24)); // 📌 Días restantes

  // 📌 Calcular porcentaje de vida útil restante
  let porcentajeVidaUtil = cicloHoja > 0 ? (diasRestantes / cicloHoja) * 100 : 0;
  porcentajeVidaUtil = porcentajeVidaUtil > 0 ? porcentajeVidaUtil.toFixed(2) : 0; // 📌 Formatear a 2 decimales

  return { diasRestantes, porcentajeVidaUtil };
};

const openEditEquipoModal = (equipo) => {
  setEquipoSeleccionado(equipo);
  setShowEditModal(true);
};

const openAddEquipoModal = () => {
    setShowAddEquipo(true);
};


const closeAddEquipoModal = () => {
    setShowAddEquipo(false);
};

const closeEditEquipoModal = () => {
  setShowEditModal(false);
  setEquipoSeleccionado(null);
};


const handleEditRaspadorChange = (e) => {
  const { name, value } = e.target;
  setEquipoSeleccionado((prevState) => ({
      ...prevState,
      [name]: value,
  }));

  // 📌 Recalcular ciclo de hoja, días de vida útil y porcentaje si cambian las fechas
  if (name === "fecha_ultimo_cambio" || name === "proximo_cambio") {
      const fechaInicio = name === "fecha_ultimo_cambio" ? value : equipoSeleccionado.fecha_ultimo_cambio;
      const fechaFin = name === "proximo_cambio" ? value : equipoSeleccionado.proximo_cambio;

      if (fechaInicio && fechaFin) {
          const cicloHoja = calcularDiferenciaDias(fechaInicio, fechaFin);
          const diasRestantes = calcularDiferenciaDias(new Date(), fechaFin);
          const porcentajeVida = cicloHoja > 0 ? ((diasRestantes / cicloHoja) * 100).toFixed(2) : 0;

          setEquipoSeleccionado((prevState) => ({
              ...prevState,
              ciclo_hoja: cicloHoja, // 📌 Actualiza ciclo de hoja
              dias_vida_util_disponible: diasRestantes, // 📌 Actualiza días restantes
              porcentaje_vida_util_disponible: porcentajeVida, // 📌 Actualiza porcentaje de vida útil
          }));
      }
  }
};

const handleAddCatTag = async () => {
    if (!categoriaTagSeleccionado.nombre) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Debes ingresar un nombre para la categoría.",
            confirmButtonText: "Aceptar",
        });
        return;
    }
    try{
        const response = await addCategoriaTag(categoriaTagSeleccionado.nombre)
            Swal.fire({
                icon:"success",
                title:"Categoría agregada",
                text:"Categoría agregada correctamente",
                confirmButtonText:"Aceptar"
            })
            closeCategoriaTagModal()
        
    }catch(error){
        Swal.fire({
            icon:"error",
            title:"Error",
            text:error.response?.data?.detail || "Hubo un problema al agregar la categoría",
            confirmButtonText:"Aceptar"
        })
    }
}

const handleUpdateEquipo = async () => {

  if (!equipoSeleccionado.id) {
      Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se encontró un ID de equipo válido.",
          confirmButtonText: "Aceptar",
      });
      return;
  }

  try {
      await updateEquipo(equipoSeleccionado.id, equipoSeleccionado);
      Swal.fire({
          icon: "success",
          title: "Equipo actualizado",
          text: "Los datos fueron modificados correctamente.",
          confirmButtonText: "Aceptar",
      });

      // 🔄 Actualizar la lista de equipos
      const updatedEquipos = await getRaspadores();
      setRaspadores(updatedEquipos);
      closeEditEquipoModal();
  } catch (error) {
      Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.detail || "Hubo un problema al actualizar el equipo.",
          confirmButtonText: "Aceptar",
      });
  }
};




  const calcularDiferenciaDias = (fechaInicio, fechaFin) => {
    const date1 = new Date(fechaInicio);
    const date2 = new Date(fechaFin);

    if (isNaN(date1) || isNaN(date2)) return 0; // Si alguna fecha es inválida, devolver 0

    const diferenciaTiempo = date2.getTime() - date1.getTime();
    return Math.max(Math.ceil(diferenciaTiempo / (1000 * 3600 * 24)), 0); // Convertir a días y asegurar que no sea negativo
};

const handleInputChange = (e) => {
  const { name, value } = e.target;
  setNewRaspador((prevState) => ({
      ...prevState,
      [name]: value,
  }));

  // 📌 Si el usuario cambia las fechas, recalcular el ciclo de hoja y los días de vida útil
  if (name === "fecha_ultimo_cambio" || name === "proximo_cambio") {
      const fechaInicio = name === "fecha_ultimo_cambio" ? value : newRaspador.fecha_ultimo_cambio;
      const fechaFin = name === "proximo_cambio" ? value : newRaspador.proximo_cambio;

      if (fechaInicio && fechaFin) {
          const cicloHoja = calcularDiferenciaDias(fechaInicio, fechaFin);
          const diasRestantes = calcularDiferenciaDias(new Date(), fechaFin);
          const porcentajeVida = cicloHoja > 0 ? ((diasRestantes / cicloHoja) * 100).toFixed(2) : 0;

          setNewRaspador((prevState) => ({
              ...prevState,
              ciclo_hoja: cicloHoja, // 📌 Actualiza ciclo de hoja
              dias_vida_util_disponible: diasRestantes, // 📌 Actualiza días restantes
              porcentaje_vida_util_disponible: porcentajeVida, // 📌 Actualiza porcentaje de vida útil
          }));
      }
  }
};

const handleLogout = async() => {
        const response = await logout()
        if(response){
            Swal.fire({
                icon:'success',
                title:'Logout',
                text:'Sesión cerrada correctamente',
                confirmButtonText:'Aceptar'
            })
            nav('/')
        }
    } 

    const handleAddRaspador = async () => {
      if (!newRaspador.equipo) {
          Swal.fire({
              icon: "error",
              title: "Error",
              text: "Debes seleccionar un equipo antes de agregar el raspador.",
              confirmButtonText: "Aceptar",
          });
          return;
      }
  
      try {
          await addRaspador(
              newRaspador.equipo,
              newRaspador.raspador,
              newRaspador.dias_vida_util_disponible,
              newRaspador.porcentaje_vida_util_disponible,
              newRaspador.accion,
              newRaspador.estatus,
              newRaspador.fecha_ultimo_cambio,
              newRaspador.ciclo_hoja,
              newRaspador.proximo_cambio
          );
  
          Swal.fire({
              icon: "success",
              title: "Raspador agregado",
              text: "El raspador fue agregado correctamente.",
              confirmButtonText: "Aceptar",
          });
  
          // 🔄 Actualizar la lista de raspadores después de agregar uno nuevo
          const updatedRaspadores = await getRaspadores();
          setRaspadores(updatedRaspadores);
  
          // 📌 Restablecer el formulario después de agregar
          setNewRaspador({
              equipo: "",
              raspador: "",
              dias_vida_util_disponible: "",
              porcentaje_vida_util_disponible: "",
              accion: "",
              estatus: "",
              fecha_ultimo_cambio: "",
              ciclo_hoja: "",
              proximo_cambio: "",
          });
          closeRaspadorModal();
      } catch (error) {
          Swal.fire({
              icon: "error",
              title: "Error",
              text: "Hubo un problema al agregar el raspador.",
              confirmButtonText: "Aceptar",
          });
          closeRaspadorModal();
      }
  };

  
  // 🔹 Filtrar equipos por categoría seleccionada
  const equiposFiltrados = categoriaSeleccionada
  ? equipos.filter((equipo) => parseInt(equipo.categoria) === parseInt(categoriaSeleccionada))
  : equipos;

return (
  <>
    <div className="p-6">
    <h2 className="text-3xl font-bold mb-4 text-gray-800 text-center">Lista de Equipos y Raspadores</h2>

      {/* 🔹 Filtro por Categoría */}
      <div 
    className="mb-6 flex flex-col md:flex-row justify-between items-center gap-6 p-4 rounded-lg shadow-lg bg-white bg-opacity-80 w-full relative"
    style={{ backgroundImage: "url('/Fondo.png')", backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
>
    {/* 🔹 Filtro por Categoría */}
    <div className="flex items-center gap-3">
        <label className="text-lg font-semibold text-gray-800">Filtrar por Categoría:</label>
        <select
            className="border p-2 rounded-lg bg-white shadow-md text-gray-800 focus:ring-2 focus:ring-green-500"
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
        >
            <option value="">Todas</option>
            {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                </option>
            ))}
        </select>
    </div>



    {/* 🔹 Botones de Acción */}
    <div className="flex gap-4">
        <button 
            onClick={handleLogout} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
            Logout
        </button>

        <button 
            onClick={openRaspadorModal} 
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
            Agregar Raspador
        </button>

        <button 
            onClick={openAddEquipoModal} 
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
            Agregar Equipo
        </button>

        <button 
            onClick={openCategoriaTagModal} 
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
            Agregar Categoria
        </button>
    </div>
</div>


    {/* 🔹 Tabla de Equipos y Raspadores */}
    <div className="overflow-x-auto rounded-xl">
    <table className="w-full border border-gray-300 shadow-lg text-md">
        <thead className="bg-green-600 text-white">
            <tr>
                <th className="border px-4 py-3 text-left">Categoría</th>
                <th className="border px-4 py-3 text-left">TAG del Equipo</th>
                <th className="border px-4 py-3 text-left">Tipo de Raspador</th>
                <th className="border px-4 py-3 text-left">Días de Vida Útil</th>
                <th className="border px-4 py-3 text-left">% de Vida Útil</th>
                <th className="border px-4 py-3 text-left">Acción Recomendada</th>
                <th className="border px-4 py-3 text-left">Estado</th>
                <th className="border px-4 py-3 text-left">Último Cambio</th>
                <th className="border px-4 py-3 text-left">Ciclo Hoja</th>
                <th className="border px-4 py-3 text-left">Próximo Cambio</th>
                <th className="border px-4 py-3 text-left">Acciones</th>
            </tr>
        </thead>
        <tbody>
            {equiposFiltrados.length > 0 ? (
                equiposFiltrados.map((equipo, index) => (
                    raspadores
                        .filter((raspador) => parseInt(raspador.equipo) === parseInt(equipo.id))
                        .map((raspador) => (
                            <tr key={raspador.id} className={index % 2 === 0 ? "bg-white hover:bg-green-100" : "bg-green-50 hover:bg-green-100"}>
                                <td className="border px-4 py-3">
                                    {categorias.find((cat) => cat.id === equipo.categoria)?.nombre || "Sin Categoría"}
                                </td>
                                <td className="border px-4 py-3 font-bold text-gray-800">{equipo.tag_estandar}</td>
                                <td className="border px-4 py-3">{raspador.raspador}</td>
                                <td className="border px-4 py-3 text-center">{raspador.dias_vida_util_disponible} días</td>
                                <td className="border px-4 py-3 text-center">{raspador.porcentaje_vida_util_disponible}%</td>
                                <td className="border px-4 py-3">{raspador.accion}</td>
                                <td className="border px-4 py-3 text-center font-bold text-green-700">{raspador.estatus}</td>
                                <td className="border px-4 py-3 text-center">{raspador.fecha_ultimo_cambio}</td>
                                <td className="border px-4 py-3 text-center">{raspador.ciclo_hoja} días</td>
                                <td className="border px-4 py-3 text-center">{raspador.proximo_cambio}</td>
                                <td className="border px-4 py-3 text-center">
                                    <div className="flex justify-center gap-2">
                                        {/* 🔹 Botón Editar */}
                                        <button 
                                            onClick={() => openEditEquipoModal(raspador)} 
                                            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                        >
                                            ✏️ Editar
                                        </button>

                                        {/* 🔹 Botón Eliminar */}
                                        <button 
                                            onClick={() => handleDeleteRas(raspador.id)} 
                                            className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                                        >
                                            🗑️ Eliminar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                ))
            ) : (
                <tr>
                    <td colSpan="11" className="text-center p-4 text-gray-500">
                        No hay raspadores registrados.
                    </td>
                </tr>
            )}
        </tbody>
    </table>
</div>

    {showRaspadorModal && (
    <div
        id="modal-backdrop"
        className="fixed inset-0 bg-opacity-50 backdrop-blur-md flex justify-center items-center px-4 animate-fadeIn"
    >
        <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg relative" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6 text-center text-gray-800">Agregar Nuevo Raspador</h3>

            <div className="grid grid-cols-2 gap-4">
                {/* 🔹 Equipo */}
                <div className="col-span-2">
                    <label className="block text-gray-700 font-semibold">Tag</label>
                    <select 
                        name="equipo" 
                        className="border p-2 rounded-lg w-full" 
                        value={newRaspador.equipo} 
                        onChange={handleInputChange}
                    >
                        <option value="">Seleccione un equipo</option>
                        {equipos.map((eq) => (
                            <option key={eq.id} value={eq.id}>
                                {eq.tag_estandar}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 🔹 Tipo de Raspador */}
                <div>
                    <label className="block text-gray-700 font-semibold">Tipo de Raspador</label>
                    <input 
                        type="text" 
                        name="raspador" 
                        className="border p-2 rounded-lg w-full" 
                        value={newRaspador.raspador}
                        onChange={handleInputChange} 
                    />
                </div>

              <div>
                  <label className="block text-gray-700 font-semibold">Días de Vida Útil Restantes</label>
                  <input 
                      type="number" 
                      name="dias_vida_util_disponible" 
                      className="border p-2 rounded-lg w-full bg-gray-100 cursor-not-allowed" 
                      value={newRaspador.dias_vida_util_disponible} 
                      readOnly
                  />
              </div>

            <div>
                <label className="block text-gray-700 font-semibold">% de Vida Útil Restante</label>
                <input 
                    type="number" 
                    name="porcentaje_vida_util_disponible" 
                    className="border p-2 rounded-lg w-full bg-gray-100 cursor-not-allowed" 
                    value={newRaspador.porcentaje_vida_util_disponible} 
                    readOnly
                />
            </div>

                {/* 🔹 Acción Recomendada */}
<div>
                    <label className="block text-gray-700 font-semibold">Accion Recomendada</label>
                    <input 
                        type="text" 
                        name="accion" 
                        className="border p-2 rounded-lg w-full bg-gray-100 cursor-not-allowed text-gray-800" 
                        value={
                            newRaspador.dias_vida_util_disponible > 30 ? newRaspador.accion = "El raspador tiene una vida útil adecuada." :
                            newRaspador.dias_vida_util_disponible <= 0 ? newRaspador.accion = "Deshabilitado" :
                            newRaspador.dias_vida_util_disponible <= 30 && newRaspador.dias_vida_util_disponible > 15 ? newRaspador.accion ="Se recomienda programar una revisión pronto." :
                            newRaspador.dias_vida_util_disponible <= 15 && newRaspador.dias_vida_util_disponible > 0 ? newRaspador.accion ="¡Atención! Cambio recomendado en breve." :
                            ""
                        }
                        readOnly
                    />
                </div>

                {/* 🔹 Estado */}
                <div>
                    <label className="block text-gray-700 font-semibold">Estado</label>
                    <input 
                        type="text" 
                        name="estatus" 
                        className="border p-2 rounded-lg w-full" 
                        value={newRaspador.estatus}
                        onChange={handleInputChange} 
                    />
                </div>

                {/* 🔹 Fecha Último Cambio */}
                <div>
                    <label className="block text-gray-700 font-semibold">Último Cambio</label>
                    <input 
                        type="date" 
                        name="fecha_ultimo_cambio" 
                        className="border p-2 rounded-lg w-full" 
                        value={newRaspador.fecha_ultimo_cambio}
                        onChange={handleInputChange} 
                    />
                </div>

                {/* 🔹 Ciclo Hoja */}
                <div>
                    <label className="block text-gray-700 font-semibold">Ciclo Hoja</label>
                    <input 
                        type="number" 
                        name="ciclo_hoja" 
                        className="border p-2 rounded-lg w-full" 
                        value={newRaspador.ciclo_hoja}
                        onChange={handleInputChange} 
                        disabled
                    />
                </div>

                {/* 🔹 Próximo Cambio */}
                <div>
                    <label className="block text-gray-700 font-semibold">Próximo Cambio</label>
                    <input 
                        type="date" 
                        name="proximo_cambio" 
                        className="border p-2 rounded-lg w-full" 
                        value={newRaspador.proximo_cambio}
                        onChange={handleInputChange} 
                    />
                </div>
            </div>

            {/* 🔹 Botones */}
            <div className="flex justify-between mt-6">
                <button onClick={closeRaspadorModal} className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition">
                    Cancelar
                </button>
                <button onClick={handleAddRaspador} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                    Agregar
                </button>
            </div>
        </div>
    </div>
)}

{showEditEquipoModal && (
    <div
        id="modal-backdrop"
        className="fixed inset-0 bg-opacity-50 backdrop-blur-md flex justify-center items-center px-4 animate-fadeIn"
    >
        <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg relative" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6 text-center text-gray-800">Editar Raspador</h3>

            <div className="grid grid-cols-2 gap-4">
                {/* 🔹 Equipo (No editable) */}
                <div className="col-span-2">
                    <label className="block text-gray-700 font-semibold">Equipo</label>
                    <input 
                        type="text" 
                        className="border p-2 rounded-lg w-full bg-gray-100 cursor-not-allowed" 
                        value={equipos.find(eq => eq.id === equipoSeleccionado.equipo)?.tag_estandar || "Desconocido"} 
                        readOnly
                    />
                </div>

                {/* 🔹 Tipo de Raspador */}
                <div>
                    <label className="block text-gray-700 font-semibold">Tipo de Raspador</label>
                    <input 
                        type="text" 
                        name="raspador" 
                        className="border p-2 rounded-lg w-full" 
                        value={equipoSeleccionado.raspador} 
                        onChange={handleEditRaspadorChange}
                    />
                </div>

                {/* 🔹 Días de Vida Útil (Automático) */}
                <div>
                    <label className="block text-gray-700 font-semibold">Días de Vida Útil</label>
                    <input 
                        type="number" 
                        name="dias_vida_util_disponible" 
                        className="border p-2 rounded-lg w-full bg-gray-100 cursor-not-allowed" 
                        value={equipoSeleccionado.dias_vida_util_disponible} 
                        readOnly
                    />
                </div>

                {/* 🔹 Porcentaje de Vida Útil (Automático) */}
                <div>
                    <label className="block text-gray-700 font-semibold">% Vida Útil</label>
                    <input 
                        type="number" 
                        name="porcentaje_vida_util_disponible" 
                        className="border p-2 rounded-lg w-full bg-gray-100 cursor-not-allowed" 
                        value={equipoSeleccionado.porcentaje_vida_util_disponible} 
                        readOnly
                    />
                </div>

                {/* 🔹 Acción Recomendada */}
                <div className="col-span-2">
                    <label className="block text-gray-700 font-semibold">Acción Recomendada</label>
                    <input 
                        type="text" 
                        name="accion" 
                        className="border p-2 rounded-lg w-full" 
                        value={
                            equipoSeleccionado.dias_vida_util_disponible <= 0 ? equipoSeleccionado.accion = "Deshabilitado" :
                            equipoSeleccionado.dias_vida_util_disponible > 30 ? equipoSeleccionado.accion = "El raspador tiene una vida útil adecuada." :
                            equipoSeleccionado.dias_vida_util_disponible <= 30 && equipoSeleccionado.dias_vida_util_disponible > 15 ? newRaspador.accion ="Se recomienda programar una revisión pronto." :
                            equipoSeleccionado.dias_vida_util_disponible <= 15 && equipoSeleccionado.dias_vida_util_disponible > 0 ? newRaspador.accion ="¡Atención! Cambio recomendado en breve." :
                            "¡Cambio inmediato requerido!"
                        }
                        readOnly
                    />
                </div>

                {/* 🔹 Estado */}
                <div>
                    <label className="block text-gray-700 font-semibold">Estado</label>
                    <input 
                        type="text" 
                        name="estatus" 
                        className="border p-2 rounded-lg w-full" 
                        value={equipoSeleccionado.estatus} 
                        onChange={handleEditRaspadorChange}
                    />
                </div>

                {/* 🔹 Fecha Último Cambio */}
                <div>
                    <label className="block text-gray-700 font-semibold">Último Cambio</label>
                    <input 
                        type="date" 
                        name="fecha_ultimo_cambio" 
                        className="border p-2 rounded-lg w-full" 
                        value={equipoSeleccionado.fecha_ultimo_cambio} 
                        onChange={handleEditRaspadorChange}
                    />
                </div>

                {/* 🔹 Ciclo Hoja (Automático) */}
                <div>
                    <label className="block text-gray-700 font-semibold">Ciclo Hoja</label>
                    <input 
                        type="number" 
                        name="ciclo_hoja" 
                        className="border p-2 rounded-lg w-full bg-gray-100 cursor-not-allowed" 
                        value={equipoSeleccionado.ciclo_hoja} 
                        disabled
                    />
                </div>

                {/* 🔹 Próximo Cambio */}
                <div>
                    <label className="block text-gray-700 font-semibold">Próximo Cambio</label>
                    <input 
                        type="date" 
                        name="proximo_cambio" 
                        className="border p-2 rounded-lg w-full" 
                        value={equipoSeleccionado.proximo_cambio} 
                        onChange={handleEditRaspadorChange}
                    />
                </div>
            </div>

            {/* 🔹 Botones */}
            <div className="flex justify-between mt-6">
                <button onClick={closeEditEquipoModal} className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition">
                    Cancelar
                </button>
                <button onClick={handleUpdateEquipo} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                    Guardar
                </button>
            </div>
        </div>
    </div>
)}

{showAddEquipo && (
    <div
        id="modal-backdrop"
        className="fixed inset-0 bg-opacity-50 backdrop-blur-md flex justify-center items-center px-4 animate-fadeIn"
    >
        <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg relative" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6 text-center text-gray-800">Agregar Equipo</h3>

            <div className="grid grid-cols-2 gap-4">
                {/* 🔹 Selección de Categoría */}
                <div className="col-span-2">
                    <label className="block text-gray-700 font-semibold">Categoría</label>
                    <select
                        name="categoria"
                        className="border p-2 rounded-lg w-full"
                        value={tagSeleccionado.categoria || ""}
                        onChange={handleChange}
                    >
                        <option value="">Seleccione una categoría</option>
                        {categorias.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 🔹 Ingreso del TAG estándar */}
                <div className="col-span-2">
                    <label className="block text-gray-700 font-semibold">TAG del Equipo</label>
                    <input
                        type="text"
                        name="tag_estandar"
                        className="border p-2 rounded-lg w-full"
                        value={tagSeleccionado.tag_estandar || ""}
                        onChange={handleChange}
                    />
                </div>

                {/* 🔹 Botones */}
                <div className="flex justify-between mt-6 col-span-2">
                    <button onClick={closeAddEquipoModal} className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition">
                        Cancelar
                    </button>
                    <button onClick={handleAddTag} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    </div>
)}

{showCatTagModal && (
    <div
        id="modal-backdrop"
        className="fixed inset-0 bg-opacity-50 backdrop-blur-md flex justify-center items-center px-4 animate-fadeIn"
    >
        <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg relative" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6 text-center text-gray-800">Agregar Categoria</h3>


                {/* 🔹 Ingreso del TAG estándar */}
                <div className="col-span-2">
                    <label className="block text-gray-700 font-semibold">Categoria</label>
                    <input
                        type="text"
                        name="nombre"
                        className="border p-2 rounded-lg w-full"
                        value={categoriaTagSeleccionado.nombre || ""}
                        onChange={handleChangeCat}
                    />
                </div>

                {/* 🔹 Botones */}
                <div className="flex justify-between mt-6 col-span-2">
                    <button onClick={closeCategoriaTagModal} className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition">
                        Cancelar
                    </button>
                    <button onClick={handleAddCatTag} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                        Guardar
                    </button>
                </div>
            </div>
        </div>
)}
  </div>
  </>
);
}



export default Menu;
