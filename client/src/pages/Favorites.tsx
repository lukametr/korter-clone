import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Heart, MapPin, Bed, Bath, Square } from 'lucide-react';

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
  createdAt?: string;
  owner?: {
    firstName: string;
    lastName: string;
  };
  company?: {
    name: string;
  };
}

const Favorites: React.FC = () => {
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState<Property[]>([]);

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const removeFavorite = (propertyId: string) => {
    const updatedFavorites = favorites.filter(property => property._id !== propertyId);
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t.favorites.title}</h1>
          <p className="text-gray-600 text-lg">
            {t.favorites.noFavorites}
          </p>
          <p className="text-gray-500 mt-2">
            {t.favorites.noFavoritesDesc}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t.favorites.title}
          </h1>
          <p className="text-lg text-gray-600">
            {favorites.length} {t.common.properties}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {favorites.map((property) => (
            <div key={property._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              {/* Property Image */}
              <div className="relative h-48 md:h-56 lg:h-64">
                <img
                  src={property.mainImage || property.images?.[0] || '/no-image.png'}
                  alt={property.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/no-image.png';
                  }}
                />
                
                {/* Remove from Favorites Button */}
                <button
                  onClick={() => removeFavorite(property._id)}
                  className="absolute top-3 right-3 bg-white/90 hover:bg-white text-red-500 p-2 rounded-full shadow-md transition-all duration-200"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>

                {/* Type Badge */}
                <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                  {property.transactionType === 'sale' ? t.search.forSale : 
                   property.transactionType === 'rent' ? t.search.forRent : 
                   property.transactionType}
                </div>

                {/* Price Badge */}
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 md:px-4 py-2 rounded-lg shadow-sm">
                  <span className="text-base md:text-lg font-bold text-gray-900">
                    {property.price.toLocaleString()} {property.currency === 'GEL' ? '₾' : property.currency === 'USD' ? '$' : '€'}
                  </span>
                </div>
              </div>

              <div className="p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                  {property.title}
                </h3>
                <p className="text-gray-600 mb-3 md:mb-4 flex items-center text-sm md:text-base">
                  <MapPin size={16} className="mr-2 flex-shrink-0" />
                  <span className="truncate">{property.address}, {property.city}</span>
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-4">
                    {property.bedrooms && (
                      <div className="flex items-center">
                        <Bed size={16} className="mr-1" />
                        <span>{property.bedrooms}</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center">
                        <Bath size={16} className="mr-1" />
                        <span>{property.bathrooms}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Square size={16} className="mr-1" />
                      <span>{property.area} {t.properties.sqm}</span>
                    </div>
                  </div>
                </div>

                {/* Property Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {property.description}
                </p>

                <div className="flex items-center justify-between">
                  {/* Owner/Company Info */}
                  <div className="text-xs text-gray-500">
                    {property.company ? (
                      <span>{t.properties.company}: {property.company.name}</span>
                    ) : property.owner ? (
                      <span>{t.properties.owner}: {property.owner.firstName} {property.owner.lastName}</span>
                    ) : null}
                  </div>
                  
                  <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors text-sm md:text-base">
                    {t.properties.viewDetails} →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
