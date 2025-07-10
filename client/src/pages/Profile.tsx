import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  area: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  address: string;
  city: string;
  images: string[];
  mainImage?: string;
}

interface Company {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

function isCompanyObj(company: any): company is Company {
  return typeof company === 'object' && company !== null && '_id' in company;
}

interface User {
  _id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'user' | 'company' | 'admin' | 'superadmin';
  company?: Company | string;
}

const currencyOptions = [
  { value: 'GEL', label: '₾' },
  { value: 'USD', label: '$' },
  { value: 'EUR', label: '€' },
];

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Property>>({ images: [] });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user?.company && isCompanyObj(user.company)) {
      fetchProperties(user.company._id);
    } else if (user?.role === 'superadmin') {
      // superadmin-ისთვის ვიღებთ ყველა property-ს
      fetchAllProperties();
    }
  }, [user]);

  // ლოგირება images/mainImage ცვლილებაზე
  useEffect(() => {
    console.log('images:', form.images);
    console.log('mainImage:', form.mainImage);
  }, [form.images, form.mainImage]);

  const fetchProperties = async (companyId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/properties/company/${companyId}`);
      console.log('fetchProperties response:', res.data);
      setProperties(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('fetchProperties error:', err);
      setProperties([]);
    }
    setLoading(false);
  };

  const fetchAllProperties = async () => {
    setLoading(true);
    try {
      const res = await api.get('/properties');
      console.log('fetchAllProperties response:', res.data);
      // API აბრუნებს object-ს properties ველით
      const propertiesData = res.data.properties || res.data;
      setProperties(Array.isArray(propertiesData) ? propertiesData : []);
    } catch (err) {
      console.error('fetchAllProperties error:', err);
      setProperties([]);
    }
    setLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleImageUpload = async () => {
    if (imageFiles.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    imageFiles.forEach((file) => formData.append('images', file));
    try {
      const res = await api.post('/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...res.data.images],
        mainImage: prev.mainImage || res.data.images[0],
      }));
      setImageFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      // handle error
    }
    setUploading(false);
  };

  const handleSetMainImage = (img: string) => {
    setForm((prev) => ({ ...prev, mainImage: img }));
  };

  const handleRemoveImage = (img: string) => {
    setForm((prev) => ({
      ...prev,
      images: (prev.images || []).filter((i) => i !== img),
      mainImage: prev.mainImage === img ? (prev.images || []).find((i) => i !== img) : prev.mainImage,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('user:', user);
      console.log('user.company:', user?.company);
      let companyId: string | undefined = undefined;
      if (user?.company) {
        if (isCompanyObj(user.company)) {
          companyId = user.company._id;
        } else if (typeof user.company === 'string') {
          companyId = user.company;
        }
      }
      const payload = {
        ...form,
        ...(companyId ? { company: companyId } : {}),
        images: Array.isArray(form.images) ? form.images : [],
        mainImage: typeof form.mainImage === 'string' ? form.mainImage : '',
        price: Number(form.price),
        area: Number(form.area),
        rooms: form.rooms ? Number(form.rooms) : undefined,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      };
      if (editId) {
        await api.put(`/properties/${editId}`, payload);
      } else {
        await api.post('/properties', payload);
      }
      setShowForm(false);
      setForm({ images: [] });
      setEditId(null);
      if (user?.company && isCompanyObj(user.company)) {
        fetchProperties(user.company._id);
      } else if (user?.role === 'superadmin') {
        fetchAllProperties();
      }
    } catch (err) {
      // handle error
    }
  };

  const handleEdit = (property: Property) => {
    setForm({
      ...property,
      images: property.images && Array.isArray(property.images) ? property.images : [],
      mainImage: property.mainImage || (property.images && property.images[0]) || '',
    });
    setEditId(property._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('ნამდვილად გსურთ წაშლა?')) {
      await api.delete(`/properties/${id}`);
      if (user?.company && isCompanyObj(user.company)) {
        fetchProperties(user.company._id);
      } else if (user?.role === 'superadmin') {
        fetchAllProperties();
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">პროფილი</h1>
      <div className="mb-8 p-4 bg-white rounded shadow">
        {user?.role === 'superadmin' ? (
          <>
            <div className="font-semibold">სუპერ ადმინისტრატორი</div>
            <div>სახელი: {user.firstName} {user.lastName}</div>
            <div>ელ.ფოსტა: {user.email}</div>
          </>
        ) : (
          <>
            <div className="font-semibold">კომპანია: {user?.company && isCompanyObj(user.company) ? user.company.name : ''}</div>
            <div>ელ.ფოსტა: {user?.company && isCompanyObj(user.company) ? user.company.email : ''}</div>
            <div>ტელეფონი: {user?.company && isCompanyObj(user.company) ? user.company.phone : ''}</div>
            <div>ქალაქი: {user?.company && isCompanyObj(user.company) ? user.company.city : ''}</div>
            <div>მისამართი: {user?.company && isCompanyObj(user.company) ? user.company.address : ''}</div>
          </>
        )}
      </div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">ჩემი ბინები</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => {
            setShowForm(true);
            setForm({});
            setEditId(null);
          }}
        >
          ბინის დამატება
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="title" value={form.title || ''} onChange={handleChange} placeholder="სათაური" className="border p-2 rounded" required />
            <input name="price" value={form.price || ''} onChange={handleChange} placeholder="ფასი" type="number" className="border p-2 rounded" required />
            <select name="currency" value={form.currency || 'GEL'} onChange={handleChange} className="border p-2 rounded">
              {currencyOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <input name="area" value={form.area || ''} onChange={handleChange} placeholder="ფართი (მ²)" type="number" className="border p-2 rounded" required />
            <input name="rooms" value={form.rooms || ''} onChange={handleChange} placeholder="ოთახები" type="number" className="border p-2 rounded" />
            <input name="bedrooms" value={form.bedrooms || ''} onChange={handleChange} placeholder="საძინებლები" type="number" className="border p-2 rounded" />
            <input name="bathrooms" value={form.bathrooms || ''} onChange={handleChange} placeholder="სველი წერტილები" type="number" className="border p-2 rounded" />
            <input name="city" value={form.city || ''} onChange={handleChange} placeholder="ქალაქი" className="border p-2 rounded" required />
            <input name="address" value={form.address || ''} onChange={handleChange} placeholder="მისამართი" className="border p-2 rounded" required />
          </div>
          <textarea name="description" value={form.description || ''} onChange={handleChange} placeholder="აღწერა" className="border p-2 rounded w-full mt-4" rows={3} required />
          {/* Image upload */}
          <div className="mt-4">
            <label className="block mb-2 font-medium">სურათები</label>
            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageChange} />
            <button type="button" onClick={handleImageUpload} disabled={uploading} className="ml-2 bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50">ატვირთვა</button>
            <div className="flex flex-wrap mt-2 gap-2">
              {(form.images || []).map((img) => {
                // თუ უკვე იწყება http-ით, არ დაამატო არაფერი
                let src = img;
                if (!/^https?:\/\//.test(img)) {
                  if (import.meta.env.DEV) {
                    src = `http://localhost:5000${img.startsWith('/') ? img : '/' + img}`;
                  } else {
                    src = img.startsWith('/') ? img : '/' + img;
                  }
                }
                console.log('img src:', src); // ლოგირება ყოველი სურათისთვის
                return (
                  <div key={img} className="relative group">
                    <img
                      src={src}
                      alt="img"
                      className={`w-40 h-40 object-cover rounded border-2 ${form.mainImage === img ? 'border-blue-600' : 'border-gray-300'}`}
                      onLoad={e => {
                        console.log('Image loaded:', src);
                      }}
                      onError={e => {
                        console.log('Image error:', src);
                        (e.target as HTMLImageElement).src = '/no-image.png';
                        (e.target as HTMLImageElement).className = 'w-40 h-40 object-cover rounded border-2 border-red-500';
                      }}
                    />
                    <button type="button" onClick={() => handleSetMainImage(img)} className="absolute left-1 top-1 bg-white bg-opacity-80 text-xs px-1 rounded border border-blue-600 text-blue-600">{form.mainImage === img ? 'მთავარი' : 'მთავარად'}</button>
                    <button type="button" onClick={() => handleRemoveImage(img)} className="absolute right-1 top-1 bg-white bg-opacity-80 text-xs px-1 rounded border border-red-500 text-red-500">წაშლა</button>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{editId ? 'შეცვლა' : 'დამატება'}</button>
            <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => { setShowForm(false); setEditId(null); }}>გაუქმება</button>
          </div>
        </form>
      )}
      {loading ? (
        <div>იტვირთება...</div>
      ) : !Array.isArray(properties) || properties.length === 0 ? (
        <div>ბინები არ არის დამატებული.</div>
      ) : (
        <div className="space-y-4">
          {properties.map((property) => (
            <div key={property._id} className="bg-white p-4 rounded shadow flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold text-lg">{property.title}</div>
                <div className="text-gray-600">{property.address}, {property.city}</div>
                <div className="text-gray-500">ფასი: {property.price} ₾ | ფართი: {property.area} მ²</div>
                <div className="text-gray-500 mt-1">{property.description}</div>
              </div>
              <div className="flex space-x-2 mt-2 md:mt-0">
                <button onClick={() => handleEdit(property)} className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500">რედაქტირება</button>
                <button onClick={() => handleDelete(property._id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">წაშლა</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
