// frontend/src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { fetchCars } from '../services/carService';
import { fetchTestimonials } from '../services/testimonialService'; // Added testimonial service
import CarCard from '../components/cars/CarCard';
import Spinner from '../components/layout/Spinner';
import { Link } from 'react-router-dom';

const HomePage = () => {
    // State to control which view is displayed
    const [activeView, setActiveView] = useState('about');

    // --- State Variables for Car Browsing ---
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [featuredCars, setFeaturedCars] = useState([]);

    // --- Filter State Variables ---
    const [filteredCars, setFilteredCars] = useState([]);
    const [filters, setFilters] = useState({
        make: '',
        model: '',
        year: '',
        priceRange: { min: '', max: '' }
    });
    const [availableMakes, setAvailableMakes] = useState([]);
    const [availableModels, setAvailableModels] = useState([]);
    const [availableYears, setAvailableYears] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // State for testimonials from the database
    const [testimonials, setTestimonials] = useState([]);
    const [testimonialsLoading, setTestimonialsLoading] = useState(false);
    const [testimonialsError, setTestimonialsError] = useState('');

    // Load cars data on initial render
    useEffect(() => {
        loadCars();
    }, []);

    // Set featured cars when cars data changes
    useEffect(() => {
        if (cars.length > 0) {
            // Select top 4 cars based on some criteria (newest, highest rated, etc.)
            const featured = [...cars]
                .sort((a, b) => b.year - a.year) // Sort by year (newest first)
                .slice(0, 4); // Take first 4
            setFeaturedCars(featured);
        }
    }, [cars]);

    // Load testimonials data on initial render
    useEffect(() => {
        loadTestimonials();
    }, []);

    // Function to load cars data
    const loadCars = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchCars();
            setCars(data);
            setFilteredCars(data);
            extractFilterOptions(data);
        } catch (err) {
            setError('Failed to fetch car listings. Please try again later.');
            console.error("Fetch Cars Error:", err.response || err.message || err);
        } finally {
            setLoading(false);
        }
    };

    // Function to load testimonials data
    const loadTestimonials = async () => {
        setTestimonialsLoading(true);
        setTestimonialsError('');
        try {
            const data = await fetchTestimonials();
            setTestimonials(data);
        } catch (err) {
            setTestimonialsError('Failed to fetch testimonials. Using default testimonials instead.');
            console.error("Fetch Testimonials Error:", err.response || err.message || err);

            // Fallback to default testimonials if the API call fails
            setTestimonials([
                {
                    _id: '1',
                    name: "Ananya Verma",
                    role: "Automobile Journalist",
                    image: "https://randomuser.me/api/portraits/women/45.jpg",
                    text: "CrucialCars helped me find the perfect car for my latest article. The process was seamless, and the car owner was very accommodating!"
                },
                {
                    _id: '2',
                    name: "Rohan Mehta",
                    role: "Car Enthusiast",
                    image: "https://randomuser.me/api/portraits/men/50.jpg",
                    text: "As a car owner, I love sharing my vehicle with influencers. CrucialCars makes it easy to connect and earn extra income."
                }
            ]);
        } finally {
            setTestimonialsLoading(false);
        }
    };

    // Extract unique makes, models, and years from cars data
    const extractFilterOptions = (carsData) => {
        const makes = [...new Set(carsData.map(car => car.make))].sort();
        const models = [...new Set(carsData.map(car => car.model))].sort();
        const years = [...new Set(carsData.map(car => car.year))].sort((a, b) => b - a);

        setAvailableMakes(makes);
        setAvailableModels(models);
        setAvailableYears(years);
    };

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        if (name === 'minPrice' || name === 'maxPrice') {
            setFilters({
                ...filters,
                priceRange: {
                    ...filters.priceRange,
                    [name === 'minPrice' ? 'min' : 'max']: value
                }
            });
        } else {
            setFilters({
                ...filters,
                [name]: value
            });
        }
    };

    // Apply filters whenever filters state changes
    useEffect(() => {
        if (activeView === 'browse') {
            applyFilters();
        }
    }, [filters, cars, activeView]);

    // Filter cars based on current filter settings
    const applyFilters = () => {
        let result = [...cars];

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(car =>
                car.make.toLowerCase().includes(term) ||
                car.model.toLowerCase().includes(term) ||
                car.description.toLowerCase().includes(term)
            );
        }

        // Filter by make
        if (filters.make) {
            result = result.filter(car => car.make === filters.make);
        }

        // Filter by model
        if (filters.model) {
            result = result.filter(car => car.model === filters.model);
        }

        // Filter by year
        if (filters.year) {
            result = result.filter(car => car.year.toString() === filters.year);
        }

        // Filter by price range
        if (filters.priceRange.min) {
            result = result.filter(car => car.price >= Number(filters.priceRange.min));
        }

        if (filters.priceRange.max) {
            result = result.filter(car => car.price <= Number(filters.priceRange.max));
        }

        setFilteredCars(result);
    };

    // Reset all filters
    const resetFilters = () => {
        setFilters({
            make: '',
            model: '',
            year: '',
            priceRange: { min: '', max: '' }
        });
        setSearchTerm('');
    };

    // Handle search form submission
    const handleSearch = (e) => {
        e.preventDefault();
        setActiveView('browse');
        applyFilters();
    };

    const steps = [
        {
            id: 1,
            title: "Discover Unique Cars",
            description: "Browse a curated selection of unique and premium vehicles available for test drives",
            icon: "🔍"
        },
        {
            id: 2,
            title: "Book Test Drive",
            description: "Schedule a test drive at your preferred time and location",
            icon: "📅"
        },
        {
            id: 3,
            title: "Drive & Decide",
            description: "Experience the car firsthand before making your decision",
            icon: "🚗"
        }
    ];    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-theme-black-950 to-theme-purple-900 text-white py-20 md:py-28">
                <div className="container mx-auto px-4">                <div className="max-w-3xl mx-auto text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-purple-gradient">
                            Drive Unique Cars Across India
                        </h1>
                        <p className="text-xl md:text-2xl text-theme-purple-200 mb-8">
                            Connecting influencers and journalists with car owners for unforgettable driving experiences
                        </p>
                        <div className="bg-theme-black-900 bg-opacity-80 rounded-lg p-4 shadow-purple-glow border border-theme-purple-700 backdrop-blur-sm">
                            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                                <div className="flex-grow">
                                    <input
                                        type="text"
                                        placeholder="Search by make, model, or features"
                                        className="w-full px-4 py-3 text-white bg-theme-black-800 rounded border border-theme-purple-600 focus:outline-none focus:ring-2 focus:ring-theme-purple-500 placeholder-gray-500"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="gradient-button text-white font-medium py-3 px-6 rounded transition-all duration-300 transform hover:scale-105 hover:shadow-purple-glow"
                                >
                                    Search Cars                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-16">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-full">
                        <path fill="#0f0f1a" fillOpacity="1" d="M0,128L80,144C160,160,320,192,480,186.7C640,181,800,139,960,128C1120,117,1280,139,1360,149.3L1440,160L1440,320L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
                    </svg>
                </div>
            </section>{/* Navigation Tabs */}
            <div className="container mx-auto mt-10 px-4">
                <div className="flex flex-wrap justify-center mb-8">
                    <button
                        onClick={() => setActiveView('about')}
                        className={`mx-2 mb-2 px-6 py-2 rounded-full text-lg font-medium transition-all duration-300 transform hover:scale-105 ${activeView === 'about'
                            ? 'gradient-button text-white shadow-purple-glow'
                            : 'bg-theme-black-800 text-theme-purple-300 hover:bg-theme-black-700 border border-theme-purple-700'
                            }`}
                    >
                        About
                    </button>
                    <button
                        onClick={() => setActiveView('browse')}
                        className={`mx-2 mb-2 px-6 py-2 rounded-full text-lg font-medium transition-all duration-300 transform hover:scale-105 ${activeView === 'browse'
                            ? 'gradient-button text-white shadow-purple-glow'
                            : 'bg-theme-black-800 text-theme-purple-300 hover:bg-theme-black-700 border border-theme-purple-700'
                            }`}
                    >
                        Browse Cars
                    </button>
                    <button
                        onClick={() => setActiveView('how')}
                        className={`mx-2 mb-2 px-6 py-2 rounded-full text-lg font-medium transition-all duration-300 transform hover:scale-105 ${activeView === 'how'
                            ? 'gradient-button text-white shadow-purple-glow'
                            : 'bg-theme-black-800 text-theme-purple-300 hover:bg-theme-black-700 border border-theme-purple-700'
                            }`}
                    >
                        How It Works
                    </button>
                    <button
                        onClick={() => setActiveView('testimonials')}
                        className={`mx-2 mb-2 px-6 py-2 rounded-full text-lg font-medium transition-all duration-300 transform hover:scale-105 ${activeView === 'testimonials'
                            ? 'gradient-button text-white shadow-purple-glow'
                            : 'bg-theme-black-800 text-theme-purple-300 hover:bg-theme-black-700 border border-theme-purple-700'
                            }`}
                    >
                        Testimonials
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-4 pb-16">
                {/* About View - Welcome Section */}
                {activeView === 'about' && (
                    <div className="space-y-16">                        {/* Welcome Section */}                        <section className="bg-theme-black-900 bg-opacity-80 rounded-xl shadow-purple-glow p-8 text-center border border-theme-purple-800 backdrop-blur-sm animate-fadeIn">
                            <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-purple-gradient">Welcome to CrucialCars</h2>
                            <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8">
                                CrucialCars is the ultimate platform for influencers and journalists to discover and drive unique cars across India. Car owners can earn by sharing their vehicles, while influencers can create amazing content and experiences.
                            </p>
                            <div className="flex justify-center">
                                <button
                                    onClick={() => setActiveView('browse')}
                                    className="gradient-button text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 shadow-purple-glow transform hover:scale-105"
                                >
                                    Browse Cars
                                </button>
                            </div>
                        </section>{/* Featured Cars */}
                        <section>
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-purple-gradient">Featured Cars</h2>
                                <Link to="/cars" className="text-theme-purple-400 hover:text-theme-purple-300 font-medium transition-colors duration-300">
                                    View All Cars →
                                </Link>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <Spinner size="large" />
                                </div>
                            ) : error ? (
                                <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-400 px-4 py-3 rounded">
                                    {error}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {featuredCars.map(car => (
                                        <CarCard key={car._id} car={car} />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* How It Works */}
                        <section className="bg-theme-black-900 bg-opacity-80 p-8 rounded-xl shadow-purple-glow border border-theme-purple-800 backdrop-blur-sm">
                            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-purple-gradient text-center mb-12">How It Works</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {steps.map(step => (
                                    <div key={step.id} className="bg-theme-black-800 p-6 rounded-lg border border-theme-purple-700 shadow-md text-center transform transition duration-300 hover:scale-105 hover:shadow-purple-glow">
                                        <div className="text-4xl mb-4 bg-theme-black-700 rounded-full h-16 w-16 flex items-center justify-center mx-auto border border-theme-purple-600">{step.icon}</div>
                                        <h3 className="text-xl font-semibold mb-3 text-theme-purple-300">{step.title}</h3>
                                        <p className="text-gray-400">{step.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>                        {/* Testimonials */}
                        <section className="bg-theme-black-900 bg-opacity-80 p-8 rounded-xl shadow-purple-glow border border-theme-purple-800 backdrop-blur-sm">
                            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-purple-gradient text-center mb-12">What Our Customers Say</h2>

                            {testimonialsLoading ? (
                                <div className="flex justify-center py-12">
                                    <Spinner size="large" />
                                </div>
                            ) : testimonialsError ? (
                                <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-400 px-4 py-3 rounded">
                                    {testimonialsError}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {testimonials.slice(0, 3).map(testimonial => (
                                        <div key={testimonial._id || testimonial.id} className="bg-theme-black-800 p-6 rounded-lg border border-theme-purple-700 shadow-md transform transition duration-300 hover:scale-105 hover:shadow-purple-glow">
                                            <div className="flex items-center mb-4">
                                                <img
                                                    src={testimonial.image}
                                                    alt={testimonial.name}
                                                    className="w-12 h-12 rounded-full mr-4 border-2 border-theme-purple-500"
                                                />
                                                <div>
                                                    <h3 className="font-semibold text-theme-purple-300">{testimonial.name}</h3>
                                                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                                                </div>
                                            </div>
                                            <p className="text-gray-300 italic">"{testimonial.text}"</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {/* Browse Cars View */}
                {activeView === 'browse' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Browse Available Cars</h2>

                        {/* Filters Section */}
                        <div className="bg-theme-black-900 bg-opacity-80 p-6 rounded-lg shadow-purple-glow mb-8 border border-theme-purple-700 backdrop-blur-sm">
                            <h3 className="text-lg font-semibold mb-4 text-theme-purple-300">Filter Options</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                {/* Search Field */}
                                <div>
                                    <label className="block text-theme-purple-200 text-sm font-medium mb-2">Search</label>
                                    <input
                                        type="text"
                                        placeholder="Search cars..."
                                        className="w-full px-3 py-2 bg-theme-black-800 border border-theme-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-purple-500 text-gray-200 placeholder-gray-500"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {/* Make Filter */}
                                <div>
                                    <label className="block text-theme-purple-200 text-sm font-medium mb-2">Make</label>
                                    <select
                                        name="make"
                                        value={filters.make}
                                        onChange={handleFilterChange}
                                        className="w-full px-3 py-2 bg-theme-black-800 border border-theme-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-purple-500 text-gray-200"
                                    >
                                        <option value="">All Makes</option>
                                        {availableMakes.map(make => (
                                            <option key={make} value={make}>{make}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Model Filter */}
                                <div>
                                    <label className="block text-theme-purple-200 text-sm font-medium mb-2">Model</label>
                                    <select
                                        name="model"
                                        value={filters.model}
                                        onChange={handleFilterChange}
                                        className="w-full px-3 py-2 bg-theme-black-800 border border-theme-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-purple-500 text-gray-200"
                                    >
                                        <option value="">All Models</option>
                                        {availableModels.map(model => (
                                            <option key={model} value={model}>{model}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Year Filter */}
                                <div>
                                    <label className="block text-theme-purple-200 text-sm font-medium mb-2">Year</label>
                                    <select
                                        name="year"
                                        value={filters.year}
                                        onChange={handleFilterChange}
                                        className="w-full px-3 py-2 bg-theme-black-800 border border-theme-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-purple-500 text-gray-200"
                                    >
                                        <option value="">All Years</option>
                                        {availableYears.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Price Range Filter */}
                                <div>
                                    <label className="block text-theme-purple-200 text-sm font-medium mb-2">Price Range</label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="number"
                                            name="minPrice"
                                            placeholder="Min"
                                            value={filters.priceRange.min}
                                            onChange={handleFilterChange}
                                            className="w-1/2 px-3 py-2 bg-theme-black-800 border border-theme-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-purple-500 text-gray-200 placeholder-gray-500"
                                        />
                                        <input
                                            type="number"
                                            name="maxPrice"
                                            placeholder="Max"
                                            value={filters.priceRange.max}
                                            onChange={handleFilterChange}
                                            className="w-1/2 px-3 py-2 bg-theme-black-800 border border-theme-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-purple-500 text-gray-200 placeholder-gray-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Filter Actions */}
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={resetFilters}
                                    className="bg-theme-black-800 hover:bg-theme-black-700 text-theme-purple-300 font-medium py-2 px-4 rounded-md transition duration-300 mr-2 border border-theme-purple-600"
                                >
                                    Reset Filters
                                </button>
                                <button
                                    onClick={applyFilters}
                                    className="gradient-button text-white font-medium py-2 px-4 rounded-md transition duration-300 shadow-purple-glow"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>

                        {/* Results Section */}
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Spinner size="large" />
                            </div>
                        ) : error ? (
                            <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-400 px-4 py-3 rounded">
                                {error}
                            </div>
                        ) : (
                            <>
                                <div className="mb-4">
                                    <p className="text-theme-purple-300">
                                        Showing {filteredCars.length} {filteredCars.length === 1 ? 'car' : 'cars'}
                                    </p>
                                </div>

                                {filteredCars.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {filteredCars.map(car => (
                                            <CarCard key={car._id} car={car} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-theme-black-900 bg-opacity-60 border border-theme-purple-700 text-theme-purple-300 px-4 py-8 rounded text-center shadow-purple-glow">
                                        <p className="text-lg font-medium mb-2">No cars match your criteria</p>
                                        <p>Try adjusting your filter options or search term</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* How It Works View */}
                {activeView === 'how' && (
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-10 text-center text-transparent bg-clip-text bg-purple-gradient">How CrucialCars Works</h2>

                        <div className="space-y-12">
                            {steps.map((step, index) => (
                                <div key={step.id} className="flex flex-col md:flex-row items-center bg-theme-black-900 bg-opacity-70 p-6 rounded-xl border border-theme-purple-700 shadow-purple-glow transform transition duration-300 hover:scale-[1.02]">
                                    <div className="md:w-1/4 flex justify-center mb-6 md:mb-0">
                                        <div className="w-20 h-20 bg-gradient-to-br from-theme-purple-800 to-theme-black-900 rounded-full flex items-center justify-center text-3xl text-theme-purple-300 border border-theme-purple-500 shadow-purple-glow">
                                            {step.icon}
                                        </div>
                                    </div>
                                    <div className="md:w-3/4">
                                        <h3 className="text-xl font-bold mb-2">
                                            <span className="text-theme-purple-400 mr-2">Step {index + 1}:</span> <span className="text-theme-purple-200">{step.title}</span>
                                        </h3>
                                        <p className="text-gray-400 text-lg">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 text-center bg-theme-black-900 bg-opacity-70 p-8 rounded-xl border border-theme-purple-700 shadow-purple-glow">
                            <h3 className="text-2xl font-semibold mb-6 text-theme-purple-300">Ready to find your perfect car?</h3>
                            <button
                                onClick={() => setActiveView('browse')}
                                className="gradient-button text-white font-bold py-3 px-8 rounded-lg transition duration-300 text-lg shadow-purple-glow transform hover:scale-105"
                            >
                                Browse Cars Now
                            </button>
                        </div>
                    </div>
                )}

                {/* Testimonials View */}
                {activeView === 'testimonials' && (
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-3xl font-bold mb-12 text-center text-transparent bg-clip-text bg-purple-gradient">Customer Testimonials</h2>

                        {testimonialsLoading ? (
                            <div className="flex justify-center py-12">
                                <Spinner size="large" />
                            </div>
                        ) : testimonialsError ? (
                            <div className="bg-theme-black-800 border border-theme-purple-700 text-theme-purple-400 px-4 py-3 rounded mb-4">
                                {testimonialsError}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-10">
                                {testimonials.map(testimonial => (
                                    <div key={testimonial._id || testimonial.id} className="bg-theme-black-900 bg-opacity-80 p-8 rounded-xl shadow-purple-glow border border-theme-purple-700 backdrop-blur-sm transform transition duration-300 hover:scale-[1.02]">
                                        <div className="flex flex-col md:flex-row md:items-center">
                                            <div className="mb-6 md:mb-0 md:mr-8">
                                                <img
                                                    src={testimonial.image}
                                                    alt={testimonial.name}
                                                    className="w-24 h-24 rounded-full mx-auto md:mx-0 border-2 border-theme-purple-500 shadow-purple-glow"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-gray-300 text-lg italic mb-4">"{testimonial.text}"</p>
                                                <div>
                                                    <h3 className="font-semibold text-lg text-theme-purple-300">{testimonial.name}</h3>
                                                    <p className="text-gray-400">{testimonial.role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-16 bg-theme-black-900 bg-opacity-70 p-8 rounded-xl text-center border border-theme-purple-700 shadow-purple-glow">
                            <h3 className="text-2xl font-semibold mb-4 text-theme-purple-300">Ready to experience CrucialCars?</h3>
                            <p className="text-gray-300 mb-6">Join our satisfied customers and find your perfect drive today.</p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <button
                                    onClick={() => setActiveView('browse')}
                                    className="gradient-button text-white font-medium py-3 px-6 rounded-lg transition duration-300 shadow-purple-glow transform hover:scale-105"
                                >
                                    Browse Cars
                                </button>
                                <Link
                                    to="/register"
                                    className="bg-theme-black-800 hover:bg-theme-black-700 text-theme-purple-300 font-medium py-3 px-6 rounded-lg border border-theme-purple-600 transition duration-300 transform hover:scale-105"
                                >
                                    Create Account
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Join the Community Section */}
                <section className="bg-gradient-to-r from-theme-black-950 to-theme-purple-900 py-16 rounded-xl mt-16 shadow-purple-glow">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-purple-gradient mb-6">Join the Community</h2>
                        <p className="text-lg text-theme-purple-200 mb-8">
                            Are you a car owner looking to earn by sharing your unique car? Or an influencer/journalist seeking your next driving adventure? CrucialCars is the platform for you.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/register" className="gradient-button text-white font-medium py-3 px-8 rounded-lg transition duration-300 shadow-purple-glow transform hover:scale-105">
                                List Your Car
                            </Link>
                            <Link to="/browse" className="bg-theme-black-800 hover:bg-theme-black-700 text-theme-purple-300 font-medium py-3 px-8 rounded-lg border border-theme-purple-600 transition duration-300 transform hover:scale-105">
                                Explore Cars
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HomePage;