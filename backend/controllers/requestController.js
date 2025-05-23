// backend/controllers/requestController.js
import TestDriveRequest from '../models/TestDriveRequestModel.js';
import Car from '../models/CarModel.js'; // Need Car model to check availability and find owner

// @desc    Create a new test drive request
// @route   POST /api/requests
// @access  Private (Journalist only)
const createRequest = async (req, res) => {
    const { carId, requestedDateTime, message } = req.body;
    const journalistId = req.user._id; // Attached by 'protect' middleware

    try {
        // 1. Find the requested car
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        // 2. Check if the car is available
        if (!car.isAvailable) {
            return res.status(400).json({ message: 'This car is currently not available for test drives' });
        }

        // 3. Check if the journalist is trying to request their own car (edge case)
        if (car.owner.toString() === journalistId.toString()) {
            return res.status(400).json({ message: 'You cannot request a test drive for your own car' });
        }

        // 4. Check if this journalist already has an active (Pending/Approved) request for this specific car
        const existingRequest = await TestDriveRequest.findOne({
            car: carId,
            journalist: journalistId,
            status: { $in: ['Pending', 'Approved'] } // Check for active requests
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'You already have an active test drive request for this car.' });
        }

        // 5. Create the new request
        const request = new TestDriveRequest({
            journalist: journalistId,
            car: carId,
            owner: car.owner, // Get owner ID from the car document
            requestedDateTime, // Optional date/time
            message,           // Optional message
            status: 'Pending', // Default status
        });

        const createdRequest = await request.save();

        // Optionally populate details before sending back? Maybe not needed for creation.
        res.status(201).json(createdRequest);

    } catch (error) {
        console.error('Error creating test drive request:', error);
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid car ID format' });
        }
        res.status(500).json({ message: 'Server error creating request' });
    }
};

// @desc    Get test drive requests received by the logged-in owner
// @route   GET /api/requests/incoming
// @access  Private (Car Owner only)
const getIncomingRequests = async (req, res) => {
    try {
        const requests = await TestDriveRequest.find({ owner: req.user._id })
            .populate('journalist', 'name email') // Show journalist details
            .populate('car', 'make model year location') // Show basic car details
            .sort({ createdAt: -1 }); // Show newest first

        res.json(requests);
    } catch (error) {
        console.error('Error fetching incoming requests:', error);
        res.status(500).json({ message: 'Server error fetching incoming requests' });
    }
};

// @desc    Get test drive requests sent by the logged-in journalist
// @route   GET /api/requests/outgoing
// @access  Private (Journalist only)
const getOutgoingRequests = async (req, res) => {
    try {
        const requests = await TestDriveRequest.find({ journalist: req.user._id })
            .populate('owner', 'name email') // Show owner details
            .populate('car', 'make model year location images isAvailable') // Show car details including availability
            .sort({ createdAt: -1 }); // Show newest first

        res.json(requests);
    } catch (error) {
        console.error('Error fetching outgoing requests:', error);
        res.status(500).json({ message: 'Server error fetching outgoing requests' });
    }
};

// @desc    Update the status of a test drive request (Approve/Reject/Complete)
// @route   PUT /api/requests/:id/status
// @access  Private (Owner of the car related to the request only)
const updateRequestStatus = async (req, res) => {
    const { status, ownerResponse } = req.body; // New status and optional response message
    const requestId = req.params.id;
    const ownerId = req.user._id;

    // Validate the incoming status
    const allowedStatuses = ['Approved', 'Rejected', 'Completed'];
    if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }

    try {
        const request = await TestDriveRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: 'Test drive request not found' });
        }

        // Verify the logged-in user is the owner associated with this request
        if (request.owner.toString() !== ownerId.toString()) {
            return res.status(403).json({ message: 'User not authorized to update this request' });
        }

        // Prevent updating status if it's already Rejected or Completed? (Optional business logic)
        // if (['Rejected', 'Completed'].includes(request.status)) {
        //     return res.status(400).json({ message: `Request is already ${request.status} and cannot be changed.` });
        // }

        // Update status and optional response
        request.status = status;
        if (ownerResponse !== undefined) {
            request.ownerResponse = ownerResponse;
        }

        const updatedRequest = await request.save();

        // Populate details for the response
        const populatedRequest = await TestDriveRequest.findById(updatedRequest._id)
            .populate('journalist', 'name email')
            .populate('car', 'make model year');

        res.json(populatedRequest);

    } catch (error) {
        console.error('Error updating request status:', error);
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid request ID format' });
        }
        res.status(500).json({ message: 'Server error updating request status' });
    }
};


// @desc    Get a single test drive request by ID (for details view, might be useful for both roles)
// @route   GET /api/requests/:id
// @access  Private (Journalist who sent it or Owner who received it)
const getRequestById = async (req, res) => {
    try {
        const request = await TestDriveRequest.findById(req.params.id)
            .populate('journalist', 'name email')
            .populate('owner', 'name email')
            .populate('car'); // Populate full car details

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Authorization check: Ensure logged-in user is either the journalist or the owner
        if (request.journalist._id.toString() !== req.user._id.toString() &&
            request.owner._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized to view this request' });
        }

        res.json(request);

    } catch (error) {
        console.error('Error fetching request by ID:', error);
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid request ID format' });
        }
        res.status(500).json({ message: 'Server error fetching request details' });
    }
};

// @desc    Check if a journalist has an active request for a specific car
// @route   GET /api/requests/check/:carId
// @access  Private (Journalist only)
const checkExistingRequest = async (req, res) => {
    try {
        const carId = req.params.carId;
        const journalistId = req.user._id;

        console.log(`Check existing request - Car ID: ${carId}, Journalist ID: ${journalistId}`);

        if (!carId) {
            console.error('Missing car ID in check request');
            return res.status(400).json({ message: 'Car ID is required' });
        }

        // Debugging - explicitly find all requests by this journalist
        const allJournalistRequests = await TestDriveRequest.find({
            journalist: journalistId
        });
        console.log(`Found ${allJournalistRequests.length} total requests by journalist ${journalistId}`);
        
        // Check active requests for this car by this journalist
        const request = await TestDriveRequest.findOne({
            car: carId,
            journalist: journalistId,
            status: { $in: ['Pending', 'Approved'] } // Only active requests
        }).populate('car', 'make model year');

        if (!request) {
            console.log(`No active request found for car ${carId} by journalist ${journalistId}`);
            return res.status(404).json({ message: 'No active request found for this car' });
        }

        console.log(`Found existing request: ${request._id} with status: ${request.status}`);
        console.log('Full request data:', JSON.stringify(request, null, 2));
        
        // Explicitly include _id in the response for clarity
        const responseData = {
            _id: request._id,
            status: request.status,
            createdAt: request.createdAt,
            car: request.car,
            ownerResponse: request.ownerResponse,
            requestedDateTime: request.requestedDateTime,
            message: request.message
        };
        
        res.json(responseData);
    } catch (error) {
        console.error('Error checking existing request:', error);
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid car ID format' });
        }
        res.status(500).json({ message: 'Server error checking request' });
    }
};

// @desc    Withdraw (cancel) a test drive request
// @route   DELETE /api/requests/:id
// @access  Private (Journalist who created the request only)
const withdrawRequest = async (req, res) => {
    try {
        const requestId = req.params.id;
        const journalistId = req.user._id;

        console.log(`Withdraw request initiated - Request ID: ${requestId}, Journalist ID: ${journalistId}`);

        if (!requestId) {
            console.error('Missing request ID in withdraw request');
            return res.status(400).json({ message: 'Request ID is required' });
        }

        // First check if the request exists
        const request = await TestDriveRequest.findById(requestId);

        if (!request) {
            console.error(`Request with ID ${requestId} not found`);
            return res.status(404).json({ message: 'Request not found' });
        }

        console.log(`Found request to withdraw: ${JSON.stringify(request, null, 2)}`);

        // Ensure only the journalist who created the request can withdraw it
        if (request.journalist.toString() !== journalistId.toString()) {
            console.error(`Authentication failure: User ${journalistId} attempted to withdraw request ${requestId} belonging to journalist ${request.journalist}`);
            return res.status(403).json({ message: 'Not authorized to withdraw this request' });
        }

        // Check if the request is in a state that can be withdrawn
        if (request.status !== 'Pending') {
            console.error(`Cannot withdraw request with status ${request.status}`);
            return res.status(400).json({ 
                message: `Cannot withdraw a request that is already ${request.status}. Please contact the car owner.` 
            });
        }

        // Store some metadata for logging
        const carId = request.car;
        
        // Delete the request
        const deleteResult = await request.deleteOne();
        console.log(`Request ${requestId} successfully withdrawn by journalist ${journalistId}`);
        console.log(`Delete result: ${JSON.stringify(deleteResult, null, 2)}`);
        
        // Additional query to verify the request was deleted
        const verifyDeleted = await TestDriveRequest.findById(requestId);
        console.log(`Verification - Is request still present?: ${verifyDeleted ? 'Yes' : 'No'}`);
          res.json({ 
            message: 'Test drive request successfully withdrawn',
            requestId: requestId,
            carId: carId
        });
    } catch (error) {
        console.error('Error withdrawing request:', error);
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid request ID format' });
        }
        res.status(500).json({ message: 'Server error withdrawing request' });
    }
};


export {
    createRequest,
    getIncomingRequests,
    getOutgoingRequests,
    updateRequestStatus,
    getRequestById,
    checkExistingRequest,
    withdrawRequest,
};