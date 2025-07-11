import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Car,
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  Home as HomeIcon,
  Building,
  Building2 as OfficeIcon
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
  createdAt?: string;
  owner?: {
    firstName: string;
    lastName: string;
  };
  company?: {
    name: string;
  };
}

const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Hero carousel data - vako.ge style
  const heroSlides = [
    {
      id: 1,
      title: "იპოვეთ თქვენი იდეალური სახლი",
      subtitle: "თბილისის საუკეთესო უძრავი ქონება",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80"
    },
    {
      id: 2,
      title: "ქირავდება და იყიდება",
      subtitle: "ყველა ტიპის უძრავი ქონება",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    },
    {
      id: 3,
      title: "პროფესიონალური მომსახურება",
      subtitle: "სანდო და გამოცდილი ბროკერები",
      image: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    }
  ];

  // Mock featured properties with real estate images
  const mockProperties = [
    {
      id: 1,
      title: "მოდერნისტული ბინა ვაჟა-ფშაველაში",
      price: "250,000 ₾",
      location: "ვაჟა-ფშაველა, თბილისი",
      beds: 3,
      baths: 2,
      area: 85,
      parking: 1,
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      isFavorite: false,
      rating: 4.8,
      type: "ბინა"
    },
    {
      id: 2,
      title: "სტუდიო ბინა ცენტრში",
      price: "120,000 ₾",
      location: "საბურთალო, თბილისი",
      beds: 1,
      baths: 1,
      area: 45,
      parking: 0,
      image: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      isFavorite: true,
      rating: 4.5,
      type: "ბინა"
    },
    {
      id: 3,
      title: "დუპლექსი დიდუბეში",
      price: "450,000 ₾",
      location: "დიდუბე, თბილისი",
      beds: 4,
      baths: 3,
      area: 120,
      parking: 2,
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80",
      isFavorite: false,
      rating: 4.9,
      type: "სახლი"
    },
    {
      id: 4,
      title: "პენტჰაუსი მთაწმინდაზე",
      price: "850,000 ₾",
      location: "მთაწმინდა, თბილისი",
      beds: 5,
      baths: 4,
      area: 180,
      parking: 3,
      image: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      isFavorite: true,
      rating: 5.0,
      type: "ბინა"
    },
    {
      id: 5,
      title: "2 ოთახიანი ბინა ნაძალადევში",
      price: "180,000 ₾",
      location: "ნაძალადევი, თბილისი",
      beds: 2,
      baths: 1,
      area: 65,
      parking: 1,
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80",
      isFavorite: false,
      rating: 4.6,
      type: "ბინა"
    },
    {
      id: 6,
      title: "საოფისე ფართი რუსთაველზე",
      price: "320,000 ₾",
      location: "რუსთაველი, თბილისი",
      beds: 0,
      baths: 2,
      area: 95,
      parking: 2,
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      isFavorite: false,
      rating: 4.7,
      type: "ოფისი"
    }
  ];

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setLoading(true);
        const data = await getProperties();
        console.log('Featured properties data:', data);
        
        // Ensure data is an array before using slice
        if (Array.isArray(data)) {
          setFeaturedProperties(data.slice(0, 6));
        } else {
          console.warn('Properties data is not an array:', data);
          setFeaturedProperties([]);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        setFeaturedProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  // Auto-rotate hero carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Carousel */}
      <section className="relative h-[70vh] min-h-[500px] max-h-[700px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative h-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white max-w-5xl mx-auto px-6">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">{slide.title}</h1>
                  <p className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 opacity-90 max-w-3xl mx-auto">{slide.subtitle}</p>
                  <Link
                    to="/properties"
                    className="inline-block bg-white text-gray-900 px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 text-base md:text-lg shadow-lg hover:shadow-xl"
                  >
                    უძრავი ქონების ძიება
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 md:p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
        >
          <ChevronLeft size={24} className="md:w-7 md:h-7" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 md:p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
        >
          <ChevronRight size={24} className="md:w-7 md:h-7" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 md:space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white' : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-white py-8 md:py-12 -mt-16 md:-mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="მისამართი ან უბანი"
                  className="w-full pl-10 pr-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              {/* ამოღებულია ქირავდება/იყიდება და ტიპების select-ები */}
              {/* <div className="relative">
                <select className="w-full pl-4 pr-10 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none">
                  <option>ქირავდება</option>
                  <option>იყიდება</option>
                </select>
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
              <div className="relative">
                <select className="w-full pl-4 pr-10 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none">
                  <option>ყველა ტიპი</option>
                  <option>ბინა</option>
                  <option>სახლი</option>
                  <option>ოფისი</option>
                </select>
              </div> */}
              <div className="relative">
                <select className="w-full pl-4 pr-10 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none">
                  <option>ფასი</option>
                  <option>100,000 - 200,000 ₾</option>
                  <option>200,000 - 400,000 ₾</option>
                  <option>400,000+ ₾</option>
                </select>
              </div>
              <button className="bg-blue-600 text-white py-3 md:py-4 px-6 md:px-8 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg">
                ძიება
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Property Types */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">უძრავი ქონების ტიპები</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">აირჩიეთ თქვენთვის შესაფერისი ტიპი</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white rounded-xl p-6 md:p-8 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <HomeIcon className="w-12 h-12 md:w-16 md:h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">ბინები</h3>
              <p className="text-gray-600 mb-4 md:mb-6">იპოვეთ თქვენი იდეალური ბინა</p>
              <Link to="/properties" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                ნახვა →
              </Link>
            </div>
            <div className="bg-white rounded-xl p-6 md:p-8 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <Building className="w-12 h-12 md:w-16 md:h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">კოტეჯები</h3>
              <p className="text-gray-600 mb-4 md:mb-6">კომფორტული სახლები ოჯახისთვის</p>
              <Link to="/properties" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                ნახვა →
              </Link>
            </div>
            <div className="bg-white rounded-xl p-6 md:p-8 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <OfficeIcon className="w-12 h-12 md:w-16 md:h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">კომერციული ფართები</h3>
              <p className="text-gray-600 mb-4 md:mb-6">კომერციული ფართები ბიზნესისთვის</p>
              <Link to="/properties" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                ნახვა →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">პოპულარული კომპლექსები</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">იპოვეთ თქვენი იდეალური სახლი</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {loading ? (
              // Loading placeholder
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 md:h-56 lg:h-64 bg-gray-300"></div>
                  <div className="p-4 md:p-6">
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))
            ) : (
              featuredProperties.map((property) => {
                // Check if property is new (added within last 7 days)
                const isNew = new Date(property.createdAt || '') > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                
                return (
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
                    
                    {/* New Badge */}
                    {isNew && (
                      <div className="absolute top-3 md:top-4 right-3 md:right-4 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-semibold shadow-lg">
                        ახალი
                      </div>
                    )}

                    {/* Type Badge */}
                    <div className="absolute top-3 md:top-4 left-3 md:left-4 bg-blue-600 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                      {property.transactionType === 'sale' ? 'იყიდება' : 
                       property.transactionType === 'rent' ? 'ქირავდება' : 
                       property.transactionType}
                    </div>

                    {/* Price Badge */}
                    <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 bg-white/95 backdrop-blur-sm px-3 md:px-4 py-2 rounded-lg shadow-sm">
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
                          <span>{property.area}მ²</span>
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
                          <span>კომპანია: {property.company.name}</span>
                        ) : property.owner ? (
                          <span>მესაკუთრე: {property.owner.firstName} {property.owner.lastName}</span>
                        ) : null}
                      </div>
                      
                      <Link
                        to={`/properties`}
                        className="text-blue-600 font-semibold hover:text-blue-700 transition-colors text-sm md:text-base"
                      >
                        დეტალები →
                      </Link>
                    </div>
                  </div>
                </div>
                );
              })
            )}
          </div>

          <div className="text-center mt-12 md:mt-16">
            <Link
              to="/properties"
              className="inline-flex items-center bg-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 text-base md:text-lg shadow-md hover:shadow-lg"
            >
              ყველა უძრავი ქონების ნახვა
              <ChevronRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">1,250+</div>
              <div className="text-blue-100 text-sm md:text-base">გაყიდული ობიექტი</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">850+</div>
              <div className="text-blue-100 text-sm md:text-base">კმაყოფილი კლიენტი</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">15+</div>
              <div className="text-blue-100 text-sm md:text-base">წლიანი გამოცდილება</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">98%</div>
              <div className="text-blue-100 text-sm md:text-base">კმაყოფილების მაჩვენებელი</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;