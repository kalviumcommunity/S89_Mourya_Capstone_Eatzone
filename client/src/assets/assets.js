import basket_icon from './basket_icon.png'
import logo from './logo.png'
import header_img from './header_img.png'
import search_icon from './search_icon.png'
import google_signin from './google_signin.svg'
import menu_1 from './menu_1.png'
import menu_2 from './menu_2.png'
import menu_3 from './menu_3.png'
import menu_4 from './menu_4.png'
import menu_5 from './menu_5.png'
import menu_6 from './menu_6.png'
import menu_7 from './menu_7.png'
import menu_8 from './menu_8.png'
// Temporary menu images - replace with proper 80x80 category icons
import menu_9 from './menu_4.png' // Pizza (temporarily using sandwich menu image)
import menu_10 from './menu_6.png' // Sushi (temporarily using pure veg menu image)
import menu_11 from './menu_1.png' // Soup (temporarily using salad menu image)
import menu_12 from './menu_2.png' // Tacos (temporarily using rolls menu image)
import menu_13 from './menu_7.png' // Main Course (using pasta menu image)
import menu_14 from './menu_3.png' // Appetizer (temporarily using dessert menu image)

import food_1 from './food_1.png'
import food_2 from './food_2.png'
import food_3 from './food_3.png'
import food_4 from './food_4.png'
import food_5 from './food_5.png'
import food_6 from './food_6.png'
import food_7 from './food_7.png'
import food_8 from './food_8.png'
import food_9 from './food_9.png'
import food_10 from './food_10.png'
import food_11 from './food_11.png'
import food_12 from './food_12.png'
import food_13 from './food_13.png'
import food_14 from './food_14.png'
import food_15 from './food_15.png'
import food_16 from './food_16.png'
import food_17 from './food_17.png'
import food_18 from './food_18.png'
import food_19 from './food_19.png'
import food_20 from './food_20.png'
import food_21 from './food_21.png'
import food_22 from './food_22.png'
import food_23 from './food_23.png'
import food_24 from './food_24.png'
import food_25 from './food_25.png'
import food_26 from './food_26.png'
import food_27 from './food_27.png'
import food_28 from './food_28.png'
import food_29 from './food_29.png'
import food_30 from './food_30.png'
import food_31 from './food_31.png'
import food_32 from './food_32.png'

import add_icon_white from './add_icon_white.png'
import add_icon_green from './add_icon_green.png'
import remove_icon_red from './remove_icon_red.png'
import app_store from './app_store.png'
import play_store from './play_store.png'
import linkedin_icon from './linkedin_icon.png'
import facebook_icon from './facebook_icon.png'
import twitter_icon from './twitter_icon.png'
import cross_icon from './cross_icon.png'
import selector_icon from './selector_icon.png'
import rating_starts from './rating_starts.png'
import profile_icon from './profile_icon.png'
import bag_icon from './bag_icon.png'
import logout_icon from './logout_icon.png'
import parcel_icon from './parcel_icon.png'

export const assets = {
    logo,
    basket_icon,
    header_img,
    search_icon,
    rating_starts,
    add_icon_green,
    add_icon_white,
    remove_icon_red,
    app_store,
    play_store,
    linkedin_icon,
    facebook_icon,
    twitter_icon,
    cross_icon,
    selector_icon,
    profile_icon,
    logout_icon,
    bag_icon,
    parcel_icon,
    google_signin
}

export const menu_list = [
    {
        menu_name: "Rolls",
        menu_image: menu_2
    },
    {
        menu_name: "Salad",
        menu_image: menu_1
    },
    {
        menu_name: "Deserts",
        menu_image: menu_3
    },
    {
        menu_name: "Sandwich",
        menu_image: menu_4
    },
    {
        menu_name: "Cake",
        menu_image: menu_5
    },
    {
        menu_name: "Veg",
        menu_image: menu_6
    },
    {
        menu_name: "MainC",
        menu_image: menu_13
    },
    {
        menu_name: "Appetizer",
        menu_image: menu_14
    },
    // {
    //     menu_name: "Dessert",
    //     menu_image: menu_3 
    // },
    {
        menu_name: "Pizza",
        menu_image: menu_9
    },
    {
        menu_name: "Sushi",
        menu_image: menu_10
    },
    {
        menu_name: "Sashimi",
        menu_image: menu_10 // Same as Sushi
    },
    {
        menu_name: "Soup",
        menu_image: menu_11
    },
    {
        menu_name: "Tacos",
        menu_image: menu_12
    },
    {
        menu_name: "Burritos",
        menu_image: menu_12 // Same as Tacos
    },
    {
        menu_name: "Pasta",
        menu_image: menu_7
    },
    {
        menu_name: "Noodles",
        menu_image: menu_8
    }]

export const food_list = [
    {
        _id: "1",
        name: "Greek salad",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/greek-salad.jpg",
        price: 12,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Salad"
    },
    {
        _id: "2",
        name: "Veg salad",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/veg-salad.jpg",
        price: 18,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Salad"
    }, {
        _id: "3",
        name: "Clover Salad",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/clover-salad.jpg",
        price: 16,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Salad"
    }, {
        _id: "4",
        name: "Chicken Salad",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/chicken-salad.jpg",
        price: 24,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Salad"
    }, {
        _id: "5",
        name: "Lasagna Rolls",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/lasagna-rolls.jpg",
        price: 14,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Rolls"
    }, {
        _id: "6",
        name: "Peri Peri Rolls",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/peri-peri-rolls.jpg",
        price: 12,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Rolls"
    }, {
        _id: "7",
        name: "Chicken Rolls",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/chicken-rolls.jpg",
        price: 20,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Rolls"
    }, {
        _id: "8",
        name: "Veg Rolls",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/veg-rolls.jpg",
        price: 15,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Rolls"
    }, {
        _id: "9",
        name: "Ripple Ice Cream",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/ripple-ice-cream.jpg",
        price: 14,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Deserts"
    }, {
        _id: "10",
        name: "Fruit Ice Cream",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/fruit-ice-cream.jpg",
        price: 22,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Deserts"
    }, {
        _id: "11",
        name: "Jar Ice Cream",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/jar-ice-cream.jpg",
        price: 10,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Deserts"
    }, {
        _id: "12",
        name: "Vanilla Ice Cream",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/vanilla-ice-cream.jpg",
        price: 12,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Deserts"
    },
    {
        _id: "13",
        name: "Chicken Sandwich",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/chicken-sandwich.jpg",
        price: 12,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Sandwich"
    },
    {
        _id: "14",
        name: "Vegan Sandwich",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/vegan-sandwich.jpg",
        price: 18,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Sandwich"
    }, {
        _id: "15",
        name: "Grilled Sandwich",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/grilled-sandwich.jpg",
        price: 16,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Sandwich"
    }, {
        _id: "16",
        name: "Bread Sandwich",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/bread-sandwich.jpg",
        price: 24,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Sandwich"
    }, {
        _id: "17",
        name: "Cup Cake",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/cup-cake.jpg",
        price: 14,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Cake"
    }, {
        _id: "18",
        name: "Vegan Cake",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/vegan-cake.jpg",
        price: 12,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Cake"
    }, {
        _id: "19",
        name: "Butterscotch Cake",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/butterscotch-cake.jpg",
        price: 20,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Cake"
    }, {
        _id: "20",
        name: "Sliced Cake",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/sliced-cake.jpg",
        price: 15,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Cake"
    }, {
        _id: "21",
        name: "Garlic Mushroom ",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/garlic-mushroom.jpg",
        price: 14,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Pure Veg"
    }, {
        _id: "22",
        name: "Fried Cauliflower",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/fried-cauliflower.jpg",
        price: 22,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Pure Veg"
    }, {
        _id: "23",
        name: "Mix Veg Pulao",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/mix-veg-pulao.jpg",
        price: 10,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Pure Veg"
    }, {
        _id: "24",
        name: "Rice Zucchini",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/rice-zucchini.jpg",
        price: 12,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Pure Veg"
    },
    {
        _id: "25",
        name: "Cheese Pasta",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/cheese-pasta.jpg",
        price: 12,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Pasta"
    },
    {
        _id: "26",
        name: "Tomato Pasta",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/tomato-pasta.jpg",
        price: 18,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Pasta"
    }, {
        _id: "27",
        name: "Creamy Pasta",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/creamy-pasta.jpg",
        price: 16,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Pasta"
    }, {
        _id: "28",
        name: "Chicken Pasta",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/chicken-pasta.jpg",
        price: 24,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Pasta"
    }, {
        _id: "29",
        name: "Buttter Noodles",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/butter-noodles.jpg",
        price: 14,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Noodles"
    }, {
        _id: "30",
        name: "Veg Noodles",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/veg-noodles.jpg",
        price: 12,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Noodles"
    }, {
        _id: "31",
        name: "Somen Noodles",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/somen-noodles.jpg",
        price: 20,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Noodles"
    }, {
        _id: "32",
        name: "Cooked Noodles",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/food/cooked-noodles.jpg",
        price: 15,
        description: "Food provides essential nutrients for overall health and well-being",
        category: "Noodles"
    }
]
