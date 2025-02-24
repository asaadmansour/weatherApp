import * as config from './config.js'; // Import everything from config.js

// State object to store weather data and bookmark status
const state = {
    city: null,        // Stores city name
    temp: null,        // Stores temperature
    humidity: null,    // Stores humidity
    wind: null,        // Stores wind speed
    weatherIcon: null, // Stores weather icon URL
    isBookmarked: false // Tracks if the current city is bookmarked
};

// Wait for the window to load
window.addEventListener('load', () => {
    // DOM Elements
    const temp = document.querySelector('.temp');
    const humidity = document.querySelector('.humidity');
    const wind = document.querySelector('.wind');
    const weatherIcon = document.querySelector('.weather-icon');
    const searchBox = document.querySelector('.search input');
    const searchBtn = document.querySelector('.search button');
    const cityNameElement = document.querySelector('.city');
    const spinner = document.querySelector('.spinner'); // Select the spinner
    const bookmarkBtn = document.querySelector('.bookmark img'); // Correctly target the img element

    // Function to show the spinner
    const showSpinner = () => {
        spinner.style.display = 'flex'; // Adjust based on your spinner styling
    };

    // Function to hide the spinner
    const hideSpinner = () => {
        spinner.style.display = 'none';
    };

    // Function to update weather display elements
    const updateWeatherDisplay = (data) => {
        // Update DOM elements with the fetched weather data
        cityNameElement.innerHTML = data.location.name;
        temp.innerHTML = `${Math.round(data.current.temp_c)}°C`;
        humidity.innerHTML = `${data.current.humidity}%`;
        wind.innerHTML = `${Math.round(data.current.wind_kph)} KM/H`;
        weatherIcon.src = data.current.condition.icon;

        // Save the weather data in the state
        state.city = data.location.name;
        state.temp = Math.round(data.current.temp_c);
        state.humidity = data.current.humidity;
        state.wind = Math.round(data.current.wind_kph);
        state.weatherIcon = data.current.condition.icon;
        state.isBookmarked = false; // Reset bookmark status when fetching new data

        // Check if the city is bookmarked and update the bookmark icon
        updateBookmarkIcon();
    };

    // Function to fetch weather data by city name
    const fetchWeatherByCity = async (city) => {
        try {
            showSpinner(); // Show spinner before fetching data
            const { API_URL, API_KEY } = config;
            const res = await fetch(`${API_URL}?key=${API_KEY}&q=${city}&aqi=no`);
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            const data = await res.json();
            updateWeatherDisplay(data);
        } catch (error) {
            console.error('Error fetching the weather data:', error);
            alert('Failed to fetch weather data. Please try again.'); // Notify the user
        } finally {
            hideSpinner(); // Hide spinner after the request is complete
        }
    };

    // Function to fetch weather data by latitude and longitude
    const fetchWeatherByCoordinates = async (lat, lng) => {
        try {
            showSpinner();
            const { API_URL, API_KEY } = config;
            const res = await fetch(`${API_URL}?key=${API_KEY}&q=${lat},${lng}&aqi=no`);
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            const data = await res.json();
            updateWeatherDisplay(data);
        } catch (error) {
            console.error('Error fetching the weather data by coordinates:', error);
            alert('Failed to fetch weather data. Please try again.'); // Notify the user
        } finally {
            hideSpinner(); // Hide spinner after the request is complete
        }
    };

    // Function to get the current location's weather
    const getCurrentLocationWeather = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoordinates(latitude, longitude);
            }, () => {
                alert('Unable to retrieve your location');
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    };

    // Initial call to get the current location weather
    getCurrentLocationWeather();

    // Event handler for searching weather
    searchBtn.addEventListener('click', () => {
        fetchWeatherByCity(searchBox.value);
        searchBox.value = '';
    });

    // Event handler for searching weather on pressing Enter
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            fetchWeatherByCity(searchBox.value);
            searchBox.value = '';
        }
    });

    // Bookmark button click event handler
    bookmarkBtn.parentElement.addEventListener('click', () => {
        if (state.city) {
            // Retrieve existing bookmarks from localStorage, if any
            let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
            
            // Check if the city is already bookmarked
            const existingBookmarkIndex = bookmarks.findIndex(bookmark => bookmark.city === state.city);

            if (existingBookmarkIndex !== -1) {
                // If the city is already bookmarked, remove it from bookmarks
                bookmarks.splice(existingBookmarkIndex, 1);
                localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
                state.isBookmarked = false; // Update state
                bookmarkBtn.src = 'images/unbookmarked.png'; // Set to unbookmarked icon
                alert(`Weather for ${state.city} removed from bookmarks!`);
            } else {
                // If the city is not bookmarked, add it to bookmarks
                bookmarks.push({
                    city: state.city,
                    temp: state.temp,
                    humidity: state.humidity,
                    wind: state.wind,
                    weatherIcon: state.weatherIcon,
                    isBookmarked: true
                });
                localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
                state.isBookmarked = true; // Update state
                bookmarkBtn.src = 'images/bookmarked.png'; // Set to bookmarked icon
                alert(`Weather for ${state.city} bookmarked!`);
            }
        } else {
            alert('No weather data available to bookmark.');
        }
    });

    // Function to check and set the bookmark icon on page load or after weather is fetched
    const updateBookmarkIcon = () => {
        let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
        const existingBookmarkIndex = bookmarks.findIndex(bookmark => bookmark.city === state.city);

        if (existingBookmarkIndex !== -1) {
            state.isBookmarked = true;
            bookmarkBtn.src = 'images/bookmarked.png'; // Set to bookmarked icon
        } else {
            state.isBookmarked = false;
            bookmarkBtn.src = 'images/unbookmarked.png'; // Set to unbookmarked icon
        }
    };
});
