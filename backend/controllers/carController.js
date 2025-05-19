// backend/controllers/carController.js
import Car from '../models/CarModel.js';
import User from '../models/UserModel.js'; // May need user details

// @desc    Create a new car listing
// @route   POST /api/cars
// @access  Private (Car Owner only)
const createCar = async (req, res) => {
    try {
        // Get data from the request body
        const {
            make,
            model,
            year,
            color,
            price,
            mileage,
            transmission,
            fuelType,
            description,
            location
        } = req.body;

        // Create a new car object
        const car = new Car({
            owner: req.user._id, // Set owner from logged-in user
            make,
            model,
            year,
            color,
            price,
            mileage,
            transmission,
            fuelType,
            description,
            location,
            isAvailable: true, // Default to available
        });

        // If an image was uploaded, add its path to the car
        if (req.file) {
            car.image = `/uploads/${req.file.filename}`;
        }

        // Save the car to the database
        const createdCar = await car.save();

        // Return the created car
        res.status(201).json(createdCar);
    } catch (error) {
        console.error('Error creating car:', error);
        // Check for Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error creating car listing' });
    }
};

// @desc    Get all available cars (with basic filtering/searching)
// @route   GET /api/cars
// @access  Public
const getCars = async (req, res) => {
    try {
        const keyword = req.query.keyword
            ? {
                $or: [ // Search in make, model, location, description
                    { make: { $regex: req.query.keyword, $options: 'i' } }, // Case-insensitive search
                    { model: { $regex: req.query.keyword, $options: 'i' } },
                    { location: { $regex: req.query.keyword, $options: 'i' } },
                    { description: { $regex: req.query.keyword, $options: 'i' } },
                ],
            }
            : {};

        // Only show available cars in the public listing
        const cars = await Car.find({ ...keyword, isAvailable: true })
            .populate('owner', 'name email'); // Populate owner's name and email

        res.json(cars);
    } catch (error) {
        console.error('Error fetching cars:', error);
        res.status(500).json({ message: 'Server error fetching car listings' });
    }
};

// @desc    Get cars listed by the logged-in owner
// @route   GET /api/cars/my-listings
// @access  Private (Car Owner only)
const getMyCars = async (req, res) => {
    try {
        const cars = await Car.find({ owner: req.user._id }); // Find cars matching logged-in user's ID
        res.json(cars);
    } catch (error) {
        console.error('Error fetching my cars:', error);
        res.status(500).json({ message: 'Server error fetching your car listings' });
    }
};

// @desc    Get a single car by ID
// @route   GET /api/cars/:id
// @access  Public
const getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id).populate('owner', 'name email'); // Populate owner details

        if (car) {
            res.json(car);
        } else {
            res.status(404).json({ message: 'Car not found' });
        }
    } catch (error) {
        console.error('Error fetching car by ID:', error);
        // Handle CastError specifically (invalid ObjectId format)
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid car ID format' });
        }
        res.status(500).json({ message: 'Server error fetching car details' });
    }
};

// @desc    Update a car listing
// @route   PUT /api/cars/:id
// @access  Private (Owner of the car only)
const updateCar = async (req, res) => {
    const {
        make,
        model,
        year,
        color,
        price,
        mileage,
        transmission,
        fuelType,
        description,
        location,
        isAvailable
    } = req.body;

    try {
        const car = await Car.findById(req.params.id);

        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        // Check if the logged-in user is the owner of the car
        if (car.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized to update this car' });
        }

        // Update fields if they are provided
        if (make) car.make = make;
        if (model) car.model = model;
        if (year) car.year = year;
        if (color) car.color = color;
        if (price) car.price = price;
        if (mileage) car.mileage = mileage;
        if (transmission) car.transmission = transmission;
        if (fuelType) car.fuelType = fuelType;
        if (description) car.description = description;
        if (location) car.location = location;

        // Handle image update
        if (req.file) {
            car.image = `/uploads/${req.file.filename}`;
        }

        // Update availability if provided
        if (isAvailable !== undefined) {
            car.isAvailable = isAvailable;
        }

        const updatedCar = await car.save();
        res.json(updatedCar);

    } catch (error) {
        console.error('Error updating car:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid car ID format' });
        }
        res.status(500).json({ message: 'Server error updating car listing' });
    }
};

// @desc    Delete a car listing
// @route   DELETE /api/cars/:id
// @access  Private (Owner of the car only)
const deleteCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);

        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        // Check if the logged-in user is the owner
        if (car.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized to delete this car' });
        }

        // --- Important Consideration ---
        // Decide what happens to TestDriveRequests associated with this car.
        // Option 1: Delete them too (requires importing TestDriveRequest model and running deleteMany)
        // Option 2: Leave them (might lead to orphaned requests)
        // Option 3: Mark them as 'cancelled' or similar.
        // For simplicity here, we'll just delete the car. Add request handling if needed.
        // Example: await TestDriveRequest.deleteMany({ car: car._id });

        await car.deleteOne(); // Mongoose 5+ uses deleteOne() or deleteMany()

        res.json({ message: 'Car listing removed successfully' });

    } catch (error) {
        console.error('Error deleting car:', error);
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid car ID format' });
        }
        res.status(500).json({ message: 'Server error deleting car listing' });
    }
};

// @desc    Toggle car availability
// @route   PATCH /api/cars/:id/toggle-availability
// @access  Private (Owner of the car only)
const toggleAvailability = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);

        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        // Check ownership
        if (car.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized to modify this car' });
        }

        // Toggle the status
        car.isAvailable = !car.isAvailable;
        const updatedCar = await car.save();

        res.json({
            message: `Car availability set to ${updatedCar.isAvailable}`,
            isAvailable: updatedCar.isAvailable,
            car: updatedCar // Send back updated car
        });

    } catch (error) {
        console.error('Error toggling availability:', error);
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid car ID format' });
        }
        res.status(500).json({ message: 'Server error toggling car availability' });
    }
};


export {
    createCar,
    getCars,
    getMyCars,
    getCarById,
    updateCar,
    deleteCar,
    toggleAvailability,
};