// NASA API key - Replace 'DEMO_KEY' with your actual API key from https://api.nasa.gov/
const NASA_API_KEY = '2yMzdCg3scNdSYX1gRa6rItN0pZ1BFk5aYq8dIKB';

// Array of fun space facts for the "Did You Know?" section
const spaceFacts = [
  "One day on Venus is longer than one year on Venus! It takes 243 Earth days to rotate once, but only 225 Earth days to orbit the Sun.",
  "The footprints on the Moon will last for millions of years because there's no wind or water to erode them.",
  "A teaspoonful of neutron star material would weigh about 6 billion tons on Earth!",
  "Jupiter's Great Red Spot is a storm that has been raging for over 400 years and is bigger than Earth.",
  "Saturn's moon Titan has lakes and rivers made of liquid methane instead of water.",
  "The International Space Station travels at 17,500 mph and orbits Earth every 90 minutes.",
  "There are more stars in the universe than grains of sand on all the beaches on Earth.",
  "Mercury has ice at its poles despite being the closest planet to the Sun.",
  "The Milky Way galaxy is on a collision course with the Andromeda galaxy, but it won't happen for 4.5 billion years.",
  "Astronauts can grow up to 2 inches taller in space due to the lack of gravity compressing their spine.",
  "The largest volcano in our solar system is Olympus Mons on Mars - it's about 13.6 miles high!",
  "Space is completely silent because sound waves need air or another medium to travel through.",
  "The Sun is so large that about 1.3 million Earths could fit inside it.",
  "Pluto is smaller than Earth's Moon and takes 248 Earth years to complete one orbit around the Sun.",
  "The coldest place in the universe that we know of is the Boomerang Nebula at -458°F (-272°C)."
];

// Find our page elements
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const fetchButton = document.getElementById('fetchButton');
const gallery = document.getElementById('gallery');
const randomFactElement = document.getElementById('randomFact');

// Find modal elements
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const closeButton = document.querySelector('.close-button');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Call setup functions when the page loads
setupDateInputs(startInput, endInput);
displayRandomSpaceFact();

// Add click event listener to the fetch button
fetchButton.addEventListener('click', fetchSpaceImages);

// Add event listeners for closing the modal
closeButton.addEventListener('click', closeModal);
modal.addEventListener('click', function(event) {
  // Close modal if user clicks outside the modal content
  if (event.target === modal) {
    closeModal();
  }
});

// Close modal when user presses Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeModal();
  }
});

// Function to fetch space images from NASA's APOD API
async function fetchSpaceImages() {
  // Get the selected dates from the input fields
  const startDate = startInput.value;
  const endDate = endInput.value;
  
  // Check if both dates are selected
  if (!startDate || !endDate) {
    alert('Please select both start and end dates!');
    return;
  }
  
  // Show loading message while fetching data
  showLoadingMessage();
  
  try {
    // Build the NASA APOD API URL with our date range
    const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&start_date=${startDate}&end_date=${endDate}`;
    
    // Fetch data from NASA's API
    const response = await fetch(apiUrl);
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    // Convert the response to JSON format
    const apodData = await response.json();
    
    // Display the images in our gallery
    displayImages(apodData);
    
  } catch (error) {
    // Show error message if something goes wrong
    console.error('Error fetching space images:', error);
    showErrorMessage();
  }
}

// Function to show loading message
function showLoadingMessage() {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">⏳</div>
      <p>Loading amazing space images...</p>
    </div>
  `;
}

// Function to show error message
function showErrorMessage() {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">❌</div>
      <p>Sorry, we couldn't load the space images. Please try again!</p>
    </div>
  `;
}

// Function to display the fetched images in the gallery
function displayImages(apodData) {
  // Clear the gallery first
  gallery.innerHTML = '';
  
  // Check if we have any data to display
  if (!apodData || apodData.length === 0) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">🔍</div>
        <p>No images found for the selected date range.</p>
      </div>
    `;
    return;
  }
  
  // Create a gallery item for each space image OR video
  apodData.forEach(item => {
    // Display both images and videos
    if (item.media_type === 'image' || item.media_type === 'video') {
      const galleryItem = createGalleryItem(item);
      gallery.appendChild(galleryItem);
    }
  });
}

// Function to create a single gallery item
function createGalleryItem(apodItem) {
  // Create the main container for this gallery item
  const galleryItemDiv = document.createElement('div');
  galleryItemDiv.className = 'gallery-item';
  
  // Check if this is a video or image and create appropriate content
  let mediaContent = '';
  
  if (apodItem.media_type === 'video') {
    // For videos, show a video thumbnail with play button overlay
    const videoId = extractYouTubeId(apodItem.url);
    const thumbnailUrl = videoId ? 
      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : 
      'https://via.placeholder.com/480x360/0b3d91/ffffff?text=Video';
    
    mediaContent = `
      <div class="video-thumbnail">
        <img src="${thumbnailUrl}" alt="${apodItem.title}" />
        <div class="play-button">▶</div>
        <div class="video-label">VIDEO</div>
      </div>
    `;
  } else {
    // For images, show the image as before
    mediaContent = `<img src="${apodItem.url}" alt="${apodItem.title}" />`;
  }
  
  // Build the HTML content for this item using template literals
  galleryItemDiv.innerHTML = `
    ${mediaContent}
    <h3>${apodItem.title}</h3>
    <p><strong>Date:</strong> ${apodItem.date}</p>
  `;
  
  // Add click event listener to open modal when gallery item is clicked
  galleryItemDiv.addEventListener('click', function() {
    openModal(apodItem);
  });
  
  return galleryItemDiv;
}

// Function to extract YouTube video ID from URL
function extractYouTubeId(url) {
  // Handle different YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  // Return the video ID if found, otherwise return null
  return (match && match[2].length === 11) ? match[2] : null;
}

// Function to open the modal with image or video details
function openModal(apodItem) {
  // Set the modal title, date, and explanation (same for both images and videos)
  modalTitle.textContent = apodItem.title;
  modalDate.textContent = `Date: ${apodItem.date}`;
  modalExplanation.textContent = apodItem.explanation;
  
  // Handle different media types in the modal
  if (apodItem.media_type === 'video') {
    // For videos, try to embed YouTube video or show link
    const videoId = extractYouTubeId(apodItem.url);
    
    if (videoId) {
      // Embed YouTube video using iframe
      modalImage.style.display = 'none';
      const videoContainer = document.getElementById('modalVideoContainer') || createVideoContainer();
      videoContainer.innerHTML = `
        <iframe 
          width="100%" 
          height="400" 
          src="https://www.youtube.com/embed/${videoId}" 
          title="${apodItem.title}"
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
        <p class="video-link">
          <a href="${apodItem.url}" target="_blank" rel="noopener">
            🎬 Watch on YouTube
          </a>
        </p>
      `;
      videoContainer.style.display = 'block';
    } else {
      // If we can't extract video ID, show a link instead
      modalImage.style.display = 'none';
      const videoContainer = document.getElementById('modalVideoContainer') || createVideoContainer();
      videoContainer.innerHTML = `
        <div class="video-fallback">
          <div class="video-icon">🎬</div>
          <h3>Video Content</h3>
          <p>This APOD entry contains a video.</p>
          <a href="${apodItem.url}" target="_blank" rel="noopener" class="video-button">
            Watch Video
          </a>
        </div>
      `;
      videoContainer.style.display = 'block';
    }
  } else {
    // For images, show the image as before
    modalImage.src = apodItem.url;
    modalImage.alt = apodItem.title;
    modalImage.style.display = 'block';
    
    // Hide video container if it exists
    const videoContainer = document.getElementById('modalVideoContainer');
    if (videoContainer) {
      videoContainer.style.display = 'none';
    }
  }
  
  // Show the modal
  modal.style.display = 'block';
  
  // Prevent body from scrolling when modal is open
  document.body.style.overflow = 'hidden';
}

// Function to create video container in modal if it doesn't exist
function createVideoContainer() {
  const videoContainer = document.createElement('div');
  videoContainer.id = 'modalVideoContainer';
  videoContainer.className = 'modal-video-container';
  
  // Insert the video container before the modal-info div
  const modalContent = document.querySelector('.modal-content');
  const modalInfo = document.querySelector('.modal-info');
  modalContent.insertBefore(videoContainer, modalInfo);
  
  return videoContainer;
}

// Function to close the modal
function closeModal() {
  // Hide the modal
  modal.style.display = 'none';
  
  // Restore body scrolling
  document.body.style.overflow = 'auto';
}

// Function to display a random space fact
function displayRandomSpaceFact() {
  // Pick a random number between 0 and the length of our facts array
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  
  // Get the random fact from our array
  const randomFact = spaceFacts[randomIndex];
  
  // Display the fact on the page
  randomFactElement.textContent = randomFact;
}
