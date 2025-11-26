import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { Plus, Trash2, Edit, Image as ImageIcon, X, Check } from 'lucide-react';
import Cropper from 'react-easy-crop'; // THE CROPPER
import getCroppedImg from '../utils/cropImage'; // THE HELPER

const Units = () => {
    const [units, setUnits] = useState([]);
    const [properties, setProperties] = useState([]);
    
    // Main Modal State
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    // Form State
    const [propId, setPropId] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    
    // --- CROPPER STATES ---
    const [imageSrc, setImageSrc] = useState(null); // The raw uploaded image
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropper, setShowCropper] = useState(false); // Toggle Cropper Modal
    const [finalFile, setFinalFile] = useState(null); // The result to send to backend
    const [previewUrl, setPreviewUrl] = useState(null); // To show in form

    const API = "http://localhost/booking-system/backend/";
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [uRes, pRes] = await Promise.all([
                axios.get(API + 'units.php', config),
                axios.get(API + 'properties.php', config)
            ]);
            setUnits(uRes.data);
            setProperties(pRes.data);
        } catch(e) { console.error(e); }
    };

    // 1. Handle File Selection -> Open Cropper
    const onFileChange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result);
                setShowCropper(true); // Open Cropper UI
            });
            reader.readAsDataURL(file);
        }
    };

    // 2. Capture Crop Area
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // 3. Generate Final Image
    const showCroppedImage = async () => {
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            // Convert Blob to File object
            const myFile = new File([croppedBlob], "room_image.jpg", { type: "image/jpeg" });
            
            setFinalFile(myFile);
            setPreviewUrl(URL.createObjectURL(croppedBlob));
            setShowCropper(false); // Close Cropper
        } catch (e) {
            console.error(e);
        }
    };

    // 4. Form Submission
    const handleSave = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append('property_id', propId);
        fd.append('unit_name', name);
        fd.append('base_price', price);
        if(finalFile) fd.append('image', finalFile);
        if(editMode) fd.append('id', editId);

        try {
            await axios.post(API + 'units.php', fd, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            setShowModal(false);
            loadData();
            alert(editMode ? "Unit Updated!" : "Unit Created!");
        } catch(err) { alert("Error saving unit."); }
    };

    // Openers
    const openCreate = () => {
        setEditMode(false); setEditId(null);
        setPropId(properties[0]?.id || ''); setName(''); setPrice(''); 
        setFinalFile(null); setPreviewUrl(null);
        setShowModal(true);
    };

    const openEdit = (u) => {
        setEditMode(true); setEditId(u.id);
        setPropId(u.property_id); setName(u.unit_name); setPrice(u.base_price);
        setFinalFile(null);
        // Show existing image as preview if exists
        setPreviewUrl(u.image_path ? API+'uploads/units/'+u.image_path : null);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if(confirm("Delete this unit?")) {
            await axios.delete(API + `units.php?id=${id}`, config);
            loadData();
        }
    };

    return (
        <Layout title="Room Manager">
            <div className="flex justify-end mb-6">
                <button onClick={openCreate} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md hover:bg-blue-600 transition">
                    <Plus size={18} /> Add Unit
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {units.map(u => (
                    <div key={u.id} className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden group hover:shadow-lg transition-all">
                        <div className="h-48 bg-gray-100 relative">
                            {u.image_path ? (
                                <img src={API + 'uploads/units/' + u.image_path} className="w-full h-full object-cover" alt="Room" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon size={40} /></div>
                            )}
                            <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold uppercase shadow-sm">{u.status}</div>
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold text-gray-800 text-lg">{u.unit_name}</h3>
                            <p className="text-sm text-gray-500 mb-4">{u.property_name}</p>
                            <div className="flex justify-between items-center border-t pt-4">
                                <span className="text-primary font-bold text-xl">${u.base_price}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => openEdit(u)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(u.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-full"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* === MAIN FORM MODAL === */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 backdrop-blur-sm p-4">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">{editMode ? 'Edit Unit' : 'Add New Unit'}</h3>
                            <button onClick={()=>setShowModal(false)}><X size={20}/></button>
                        </div>
                        
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                                <select value={propId} onChange={e=>setPropId(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50">
                                    {properties.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Name</label>
                                <input value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 border rounded-lg" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price ($)</label>
                                <input type="number" value={price} onChange={e=>setPrice(e.target.value)} className="w-full p-2 border rounded-lg" required />
                            </div>
                            
                            {/* IMAGE INPUT & PREVIEW */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Room Image</label>
                                <input type="file" onChange={onFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" accept="image/*" />
                                
                                {previewUrl && (
                                    <div className="mt-3 relative h-40 w-full rounded-lg overflow-hidden border border-gray-200">
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute bottom-0 w-full bg-black/50 text-white text-xs text-center py-1">Selected Image</div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600">Save Unit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* === CROPPER MODAL (Overlays everything) === */}
            {showCropper && (
                <div className="fixed inset-0 bg-black z-50 flex flex-col">
                    <div className="relative flex-1 bg-black">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={16 / 9} // FORCE 16:9 Aspect Ratio for Dashboard
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        />
                    </div>
                    <div className="bg-gray-900 p-4 flex justify-between items-center px-8">
                        <div className="text-white text-sm">
                            Use scroll to zoom, drag to move.
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={()=>setShowCropper(false)} 
                                className="px-6 py-2 text-white hover:bg-gray-800 rounded-full"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={showCroppedImage} 
                                className="px-6 py-2 bg-primary text-white font-bold rounded-full hover:bg-blue-600 flex items-center gap-2"
                            >
                                <Check size={18}/> Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Units;