import React, { useState, useContext } from "react";
import "./FloatingChatbot.css";
import { StoreContext } from "../../context/StoreContext";
import { sendChatMessage } from "../../config/api";

const FloatingChatbot = () => {
  const { user, token, addToCart, food_list } = useContext(StoreContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatMode, setChatMode] = useState(null); // 'support', 'recommendation', or 'feedback'

  // Function to parse bot response and extract food items with cart buttons
  const parseMessageForItems = (text) => {
    // Legacy ITEM: format support
    const itemRegex = /ITEM:([^|]+)\|PRICE:₹([^|]+)\|CATEGORY:([^|\s]+)/g;
    // New cart button format: [Add to Cart - itemId]
    const cartButtonRegex = /\[Add to Cart - ([^\]]+)\]/g;

    const items = [];
    const cartButtons = [];
    let match;

    // Parse legacy ITEM: format
    while ((match = itemRegex.exec(text)) !== null) {
      const itemName = match[1].trim();
      const price = match[2].trim();
      const category = match[3].trim();

      const foodItem = food_list.find(item =>
        item.name.toLowerCase() === itemName.toLowerCase()
      );

      if (foodItem) {
        items.push({
          id: foodItem._id,
          name: itemName,
          price: price,
          category: category,
          foodItem: foodItem
        });
      }
    }

    // Parse new cart button format and extract food items
    while ((match = cartButtonRegex.exec(text)) !== null) {
      const itemId = match[1];
      const foodItem = food_list.find(item => item._id === itemId);
      if (foodItem) {
        cartButtons.push({
          itemId: itemId,
          foodItem: foodItem
        });
      }
    }

    // Remove both formats from the text for display
    const cleanText = text
      .replace(itemRegex, '')
      .replace(cartButtonRegex, '')
      .replace(/\s+/g, ' ')
      .trim();

    return { cleanText, items, cartButtons };
  };

  // Function to handle adding item to cart
  const handleAddToCart = (foodItem) => {
    addToCart(foodItem._id);
    // Show a brief confirmation
    setMessages(prev => [...prev, {
      role: "bot",
      text: `✅ ${foodItem.name} added to cart!`,
      isConfirmation: true
    }]);
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Reset chat when opening
      setMessages([]);
      setChatMode(null);
    }
  };

  const selectChatMode = (mode) => {
    setChatMode(mode);
    const welcomeMessage = mode === 'support'
      ? "Hello! I'm your Eatzone support assistant. How can I help you today?"
      : mode === 'recommendation'
      ? "What are you craving today? I can recommend some delicious options from our menu!"
      : mode === 'feedback'
      ? "I'd love to hear about your Eatzone experience! Please share your feedback."
      : "Hi! How can I help you today?";

    setMessages([{ role: "bot", text: welcomeMessage }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || !chatMode) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendChatMessage(input, chatMode, token);
      const { cleanText, items, cartButtons } = parseMessageForItems(data.reply);
      const botMessage = {
        role: "bot",
        text: cleanText || data.reply,
        items: items.length > 0 ? items : null,
        cartButtons: cartButtons.length > 0 ? cartButtons : null
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const goBack = () => {
    setChatMode(null);
    setMessages([]);
  };

  // Quick suggestion buttons based on upgraded prompt
  const getSuggestions = () => {
    if (chatMode === 'support') {
      return [
        "Order status",
        "Cancel my order",
        "Refund request",
        "How much time for delivery"
      ];
    } else if (chatMode === 'recommendation') {
      return [
        "Recommend me food",
        "Spicy food",
        "Something light",
        "Sweet desserts"
      ];
    } else if (chatMode === 'feedback') {
      return [
        "Food quality feedback",
        "Delivery feedback",
        "App experience",
        "Overall rating"
      ];
    }
    return [];
  };

  const handleSuggestionClick = async (suggestion) => {
    if (!chatMode) return;

    const userMessage = { role: "user", text: suggestion };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const data = await sendChatMessage(suggestion, chatMode, token);
      const { cleanText, items, cartButtons } = parseMessageForItems(data.reply);
      const botMessage = {
        role: "bot",
        text: cleanText || data.reply,
        items: items.length > 0 ? items : null,
        cartButtons: cartButtons.length > 0 ? cartButtons : null
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className={`floating-chat-button ${isOpen ? 'open' : ''}`} onClick={toggleChatbot}>
        {isOpen ? (
          <span className="close-icon">✕</span>
        ) : (
          <span className="chat-icon">💬</span>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="floating-chat-window">
          <div className="floating-chat-header">
            <span>🍽️ Eatzone Assistant</span>
            {chatMode && (
              <button className="back-button" onClick={goBack}>
                ← Back
              </button>
            )}
          </div>

          <div className="floating-chat-content">
            {!chatMode ? (
              // Mode Selection
              <div className="chat-mode-selection">
                <h3>How can I help you today?</h3>
                <div className="mode-buttons">
                  <button
                    className="mode-button support"
                    onClick={() => selectChatMode('support')}
                  >
                    <span className="mode-icon">🎧</span>
                    <div>
                      <strong>Customer Support</strong>
                      <p>Get help with orders, account issues, or general questions</p>
                    </div>
                  </button>
                  <button
                    className="mode-button recommendations"
                    onClick={() => selectChatMode('recommendation')}
                  >
                    <span className="mode-icon">🍕</span>
                    <div>
                      <strong>Food Recommendations</strong>
                      <p>Discover new dishes and get personalized suggestions</p>
                    </div>
                  </button>
                  <button
                    className="mode-button feedback"
                    onClick={() => selectChatMode('feedback')}
                  >
                    <span className="mode-icon">📝</span>
                    <div>
                      <strong>Share Feedback</strong>
                      <p>Tell us about your experience and help us improve</p>
                    </div>
                  </button>
                </div>
                <div className="quick-actions">
                  <p className="quick-actions-label">Quick Actions:</p>
                  <div className="quick-action-buttons">
                    <button
                      className="quick-action-btn"
                      onClick={() => {
                        selectChatMode('support');
                        setTimeout(() => {
                          setInput("I need help with my recent order");
                        }, 100);
                      }}
                    >
                      📦 Order Help
                    </button>
                    <button
                      className="quick-action-btn"
                      onClick={() => {
                        selectChatMode('recommendation');
                        setTimeout(() => {
                          setInput("What's popular today?");
                        }, 100);
                      }}
                    >
                      🔥 Popular Items
                    </button>
                    <button
                      className="quick-action-btn"
                      onClick={() => {
                        selectChatMode('feedback');
                        setTimeout(() => {
                          setInput("I want to share feedback");
                        }, 100);
                      }}
                    >
                      📝 Give Feedback
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Chat Interface
              <>
                <div className="floating-chat-messages">
                  {messages.map((msg, index) => (
                    <div key={index}>
                      <div
                        className={`floating-chat-bubble ${msg.role === "user" ? "user" : "bot"} ${msg.isConfirmation ? "confirmation" : ""}`}
                      >
                        {msg.text}
                      </div>
                      {/* Show Add to Cart buttons for food items (legacy format) */}
                      {msg.items && msg.items.length > 0 && (
                        <div className="food-items-container">
                          {msg.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="food-item-card">
                              <div className="food-item-info">
                                <span className="food-item-name">{item.name}</span>
                                <span className="food-item-price">₹{item.price}</span>
                                <span className="food-item-category">{item.category}</span>
                              </div>
                              <button
                                className="add-to-cart-btn"
                                onClick={() => handleAddToCart(item.foodItem)}
                              >
                                Add to Cart
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Show Add to Cart buttons for new format */}
                      {msg.cartButtons && msg.cartButtons.length > 0 && (
                        <div className="cart-buttons-container">
                          {msg.cartButtons.map((cartBtn, btnIndex) => (
                            <div key={btnIndex} className="cart-button-item">
                              <div className="cart-item-info">
                                <img
                                  src={`http://localhost:4000/images/${cartBtn.foodItem.image}`}
                                  alt={cartBtn.foodItem.name}
                                  className="cart-item-image"
                                />
                                <div className="cart-item-details">
                                  <span className="cart-item-name">{cartBtn.foodItem.name}</span>
                                  <span className="cart-item-price">₹{cartBtn.foodItem.price}</span>
                                  <span className="cart-item-category">{cartBtn.foodItem.category}</span>
                                </div>
                              </div>
                              <button
                                className="add-to-cart-btn-new"
                                onClick={() => handleAddToCart(cartBtn.foodItem)}
                              >
                                🛒 Add to Cart
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && <div className="floating-chat-bubble bot">Typing...</div>}
                </div>

                {/* Quick suggestions */}
                {messages.length === 1 && (
                  <div className="quick-suggestions">
                    <p className="suggestions-label">Quick options:</p>
                    <div className="suggestion-buttons">
                      {getSuggestions().map((suggestion, index) => (
                        <button
                          key={index}
                          className="suggestion-btn"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="floating-chat-input">
                  <input
                    type="text"
                    placeholder={`Type your message...`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                  <button onClick={sendMessage} disabled={!input.trim()}>
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;
