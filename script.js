// Load data from JSON file
fetch('dataset.json')
	.then(response => response.json())
	.then(data => {
		// Create fuse.js instance with options
		const fuse = new Fuse(data, {
			keys: ['prompt', 'answer']
		});

		// Get chatbot elements
		const chatbotContainer = document.querySelector('.chatbot');
		const chatbotBody = chatbotContainer.querySelector('.chatbot-body');
		const chatbotInput = chatbotContainer.querySelector('#chatbot-input');


    // Function to add message to chatbot
    function addMessage(message, isResponse = false) {
        // Create message element
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('chatbot-message-container');
        const messageElement = document.createElement('div');
        messageElement.classList.add('bot-message');
        const userMessageElement = document.createElement('div');
        userMessageElement.classList.add('user-message');
        messageContainer.appendChild(messageElement);
      
        // Remove padding styles from message element
        messageElement.style.paddingTop = '';
        messageElement.style.paddingBottom = '';
        userMessageElement.style.paddingTop = '';
        userMessageElement.style.paddingBottom = '';
      
        // Check if message is an image
        if (message.startsWith('<img src="')) {
          // If message is an image, create an image element and add it to the message element
          const imgElement = document.createElement('img');
          const imgSrc = message.substring(10, message.length - 2);
          imgElement.style.width = '500px';
          imgElement.style.height = 'auto';
          imgElement.onload = () => {
            messageElement.appendChild(imgElement);
            // Scroll to bottom of chatbot body
            chatbotBody.scrollTop = chatbotBody.scrollHeight;
          };
          imgElement.src = imgSrc;
        } else {
          // If message is not an image, add it as a text element
          // Add response class if message is from chatbot
          if (isResponse) {
            messageElement.classList.add('chatbot-message-response');
      
            // Split the text into characters and add them one by one with a delay
            const characters = message.split('');
            let i = 0;
            const intervalId = setInterval(() => {
              if (i < characters.length) {
                const character = characters[i];
                messageElement.innerHTML += character;
                chatbotBody.scrollTop = chatbotBody.scrollHeight;
                i++;
              } else {
                clearInterval(intervalId);
              }
            }, 15);
      
          } else {
            // If message is user input, add it directly without animation
            userMessageElement.textContent = message;
            messageContainer.removeChild(messageElement);
            messageContainer.appendChild(userMessageElement);
          }
        }
      
        // Add message to chatbot body
        chatbotBody.appendChild(messageContainer);
      
        // Scroll to bottom of chatbot body
        chatbotBody.scrollTop = chatbotBody.scrollHeight;
      } 

      // Function to generate chatbot response
      function generateResponse(input) {
          // Check if input matches any prompt in data
          const result = data.find(item => item.prompt.toLowerCase() === input.toLowerCase());
        
          if (result) {
            // Return corresponding answer if prompt is found
            return result.answer;
          } else if (input.toLowerCase().startsWith('math:')) {
            // If input starts with "math:", evaluate the expression using math.js
            const expression = input.substring(5).trim();
            try {
              const result = math.evaluate(expression);
              return `The answer is: ${result}`;
            } catch (error) {
              return 'Invalid expression';
            }
          } else if (input.toLowerCase().startsWith('image:')) {
            // If input starts with "image:", make a call to the Pexels API to retrieve a random image
            const query = input.substring(6).trim();
            const apiKey = 'rSW05Ydphkp8H0XACPFJjlANoVJx1ccxx7J5zqf9vAIkkPvvBMpCy6pd'; // Replace with your Pexels API key
        
            // Call the getRandomImagePexels function to retrieve a random image
            getRandomImagePexels(query, apiKey)
              .then(imageUrl => {
                if (imageUrl) {
                  // Create image element and add to chatbot
                  const imgElement = document.createElement('img');
                  imgElement.src = imageUrl;
                  addMessage(imgElement.outerHTML, true);
                } else {
                  // Add error message to chatbot
                  addMessage('No images found', true);
                }
              })
              .catch(error => {
                console.error(error);
                // Add error message to chatbot
                addMessage('Error retrieving image', true);
              });
          } else if (input.toLowerCase().startsWith('wiki:')) {
              // If input starts with "wiki:", make a call to the Wikipedia API to retrieve information about the topic
              const searchTerm = input.substring(5).trim();
              const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`;
              fetch(url)
        .then(response => response.json())
        .then(data => {
          if (data.title && data.extract) {
            // Add the title and extract to chatbot
            addMessage(`${data.title} - ${data.extract}`, true);
          } else {
            // Add error message to chatbot
            addMessage('No information found', true);
          }
        })
        .catch(error => {
          console.error(error);
          // Add error message to chatbot
          addMessage('Error retrieving information', true);
        });
            } else {
            // Search for matching words using fuse.js
            const searchResult = fuse.search(input);
        
            if (searchResult.length > 0) {
              // Return the first matching answer from data
              return searchResult[0].item.answer;
            } else {
              // Return a default message if no match is found
              return 'I am sorry, I did not understand your message. Please try again.';
            }
          }
        }
  

    const newChat = document.getElementById("newChat");
    newChat.addEventListener("click", function() {
      location.reload();
    });

// Define Pexels API endpoint and access key
const pexelsEndpointUrl = 'https://api.pexels.com/v1';

// Function to retrieve a random image from Pexels
async function getRandomImagePexels(keyword, apiKey) {
  const query = keyword ? encodeURIComponent(keyword) : '';
  const page = Math.floor(Math.random() * 10) + 1; // generate a random page number between 1 and 10
  const url = `${pexelsEndpointUrl}/search?query=${query}&per_page=1&page=${page}`;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: apiKey
      }
    });
    const data = await response.json();
    if (data && data.photos && data.photos.length > 0) {
      return data.photos[0].src.medium;
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}
    
    
// Keep track of whether header has been removed
let headerRemoved = false;

// Handle send button click event
const sendButton = chatbotContainer.querySelector('#chatbot-send');
sendButton.addEventListener('click', () => {
  if (!headerRemoved) {
    header.remove();
        features.remove();
    headerRemoved = true;
  }
  const input = chatbotInput.value.trim();
  if (input) {
    // Add user input to chatbot
    addMessage(input);
    chatbotInput.value = '';

    // Generate chatbot response
    const response = generateResponse(input);

    // Add chatbot response to chatbot
    addMessage(response, true);
  }
});

	// Handle enter key press event
	chatbotInput.addEventListener('keydown', event => {
		if (event.key === 'Enter') {
			sendButton.click();
		}
	});

})




.catch(error => console.error(error));