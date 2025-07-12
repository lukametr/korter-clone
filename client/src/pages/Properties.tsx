import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Search, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  SlidersHorizontal,
  Heart,
} from 'lucide-react';
import { getProperties } from '../services/api';

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
  isActive: boolean;
  transactionType: string;
  owner?: {
    firstName: string;
    lastName: string;
  };
  company?: {
    name: string;
  };
}

const Properties: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    city: '',
    minArea: '',
    maxArea: ''
  });

  useEffect(() => {
    fetchProperties();
    loadFavorites();
    
    // Get search and city parameters from URL
    const searchParam = searchParams.get('search');
    const cityParam = searchParams.get('city');
    
    if (searchParam) {
      setSearchTerm(searchParam);
    }
    
    if (cityParam) {
      setFilters(prev => ({ ...prev, city: cityParam }));
    }
  }, [searchParams]);

  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      const favoriteProperties = JSON.parse(savedFavorites);
      setFavorites(favoriteProperties.map((prop: Property) => prop._id));
    }
  };

  const toggleFavorite = (property: Property) => {
    const savedFavorites = localStorage.getItem('favorites');
    let favoriteProperties: Property[] = savedFavorites ? JSON.parse(savedFavorites) : [];
    
    const isAlreadyFavorite = favoriteProperties.some(fav => fav._id === property._id);
    
    if (isAlreadyFavorite) {
      favoriteProperties = favoriteProperties.filter(fav => fav._id !== property._id);
      setFavorites(prev => prev.filter(id => id !== property._id));
    } else {
      favoriteProperties.push(property);
      setFavorites(prev => [...prev, property._id]);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favoriteProperties));
  };

  useEffect(() => {
    filterProperties();
  }, [properties, searchTerm, filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await getProperties();
      console.log('Properties data:', data);
      setProperties(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProperties = () => {
    let filtered = [...properties];

    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter(property => property.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(property => property.price <= Number(filters.maxPrice));
    }

    if (filters.city) {
      filtered = filtered.filter(property =>
        property.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.minArea) {
      filtered = filtered.filter(property => property.area >= Number(filters.minArea));
    }
    if (filters.maxArea) {
      filtered = filtered.filter(property => property.area <= Number(filters.maxArea));
    }

    setFilteredProperties(filtered);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      city: '',
      minArea: '',
      maxArea: ''
    });
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t.properties.title}</h1>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t.search.searchByAddress}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t.search.filters}</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <SlidersHorizontal size={20} className="mr-2" />
                {showFilters ? t.common.close : t.search.filters}
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.search.minPrice}</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.search.maxPrice}</label>
                  <input
                    type="number"
                    placeholder="∞"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.search.city}</label>
                  <input
                    type="text"
                    placeholder={t.search.city}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.search.minArea}</label>
                  <input
                    type="number"
                    placeholder={t.properties.minAreaPlaceholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.minArea}
                    onChange={(e) => handleFilterChange('minArea', e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    {t.common.clear}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            {t.common.found}: <span className="font-semibold">{filteredProperties.length}</span> {t.common.properties}
          </p>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.properties.noResults}</h3>
            <p className="text-gray-600">{t.properties.noResultsDesc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {filteredProperties.map((property) => (
              <div key={property._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative h-48 md:h-56">
                  <img
                    src={property.mainImage || property.images?.[0] || '/no-image.png'}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/no-image.png';
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-lg text-sm font-semibold">
                    {property.price} {property.currency === 'GEL' ? '₾' : property.currency === 'USD' ? '$' : '€'}
                  </div>
                  <button
                    onClick={() => toggleFavorite(property)}
                    className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                      favorites.includes(property._id) 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
                    }`}
                  >
                    <Heart size={16} className={favorites.includes(property._id) ? 'fill-current' : ''} />
                  </button>
                </div>

                <div className="p-4 md:p-5">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                    {property.title}
                  </h3>
                  <p className="text-gray-600 mb-3 md:mb-4 flex items-center text-sm">
                    <MapPin size={14} className="mr-2 flex-shrink-0" />
                    <span className="truncate">{property.address}, {property.city}</span>
                  </p>

                  <div className="flex items-center justify-between text-xs md:text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-3 md:space-x-4">
                      {property.bedrooms && (
                        <div className="flex items-center">
                          <Bed size={14} className="mr-1" />
                          <span>{property.bedrooms}</span>
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="flex items-center">
                          <Bath size={14} className="mr-1" />
                          <span>{property.bathrooms}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Square size={14} className="mr-1" />
                        <span>{property.area} {t.properties.sqm}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {property.description}
                  </p>

                  {(property.owner || property.company) && (
                    <div className="text-xs text-gray-500 mb-3">
                      {property.company ? (
                        <span>{t.properties.company}: {property.company.name}</span>
                      ) : property.owner ? (
                        <span>{t.properties.owner}: {property.owner.firstName} {property.owner.lastName}</span>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
