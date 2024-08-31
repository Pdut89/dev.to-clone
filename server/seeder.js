const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

//import models
const Post = require("./models/post");
const Comment = require("./models/comment");
const Tag = require("./models/tag");
const User = require("./models/user");

// POSTS MOCK DATA
const posts = [
  {
    _id: "64f7dc5ea3d5c6e5f72e8b40",
    title: "Understanding Mongoose Schemas",
    image:
      "https://drek4537l1klr.cloudfront.net/wexler/Figures/14fig01_alt.jpg",
    body: "A detailed guide on how to use Mongoose schemas effectively in your applications.",
    tags: [
      "64f7dc7da3d5c6e5f72e8b48",
      "64f7dc7da3d5c6e5f72e8b49",
      "64f7dc8da3d5c6e5f72e8b89",
    ],
    date: "2024-08-30T08:00:00Z",
    titleURL: "understanding-mongoose-schemas",
    likes: ["64f7dca1a3d5c6e5f72e8b45"],
    bookmarks: ["64f7dca1a3d5c6e5f72e8b45"],
    unicorns: ["64f7dcb2a3d5c6e5f72e8b48"],
    comments: ["64f7dc6ea3d5c6e5f72e8b46"],
    author: "64f7dca1a3d5c6e5f72e8b45",
  },
  {
    _id: "64f7dc5ea3d5c6e5f72e8b41",
    title: "Advanced Angular Techniques",
    image:
      "https://miro.medium.com/v2/resize:fit:1200/1*_7O2f5BWgpxdkH04YOOF-g.png",
    body: "Exploring advanced techniques in Angular to build scalable applications.",
    tags: [
      "64f7dc8da3d5c6e5f72e8b49",
      "64f7dc7da3d5c6e5f72e8b49",
      "64f7dc8da3d5c6e5f72e8b89",
    ],
    date: "2024-08-31T09:00:00Z",
    titleURL: "advanced-angular-techniques",
    likes: ["64f7dcb2a3d5c6e5f72e8b48"],
    bookmarks: [],
    unicorns: [],
    comments: ["64f7dc6ea3d5c6e5f72e8b47"],
    author: "64f7dcb2a3d5c6e5f72e8b48",
  },
  {
    _id: "64f7dc9ea3d5c6e5f72e8b4a",
    title: "Mastering Node.js",
    image:
      "https://www.simplilearn.com/ice9/free_resources_article_thumb/node.js-architecture.png",
    body: "Comprehensive guide to mastering Node.js and building scalable applications.",
    tags: ["64f7dc7da3d5c6e5f72e8b49", "64f7dc8da3d5c6e5f72e8b89"],
    date: "2024-09-01T10:00:00Z",
    titleURL: "mastering-nodejs",
    likes: ["64f7dca1a3d5c6e5f72e8b52"],
    bookmarks: [],
    unicorns: [],
    comments: ["64f7dc9ea3d5c6e5f72e8b4b"],
    author: "64f7dca1a3d5c6e5f72e8b52",
  },
  {
    _id: "64f7dcb4a3d5c6e5f72e8b54",
    title: "The Art of User Research",
    image:
      "https://www.qualtrics.com/m/assets/wp-content/uploads/2021/05/1499936_UX-Research_1B_111022.png",
    body: "Explore techniques and best practices for conducting effective user research.",
    tags: [
      "64f7dcada3d5c6e5f72e8b4d",
      "64f7dc7da3d5c6e5f72e8b49",
      "64f7dc8da3d5c6e5f72e8b89",
    ],
    date: "2024-09-02T11:00:00Z",
    titleURL: "art-of-user-research",
    likes: ["64f7dcb2a3d5c6e5f72e8b48"],
    bookmarks: ["64f7dcb2a3d5c6e5f72e8b48"],
    unicorns: ["64f7dca1a3d5c6e5f72e8b53"],
    comments: ["64f7dcb4a3d5c6e5f72e8b55"],
    author: "64f7dca1a3d5c6e5f72e8b53",
  },
  {
    _id: "64f7dc7ea3d5c6e5f72e8b4a",
    title: "The Art of Digital Design",
    image: "https://pictures.abebooks.com/isbn/9780130467805-uk.jpg",
    body: "Exploring techniques and tools for digital art and graphic design.",
    tags: ["64f7dcada3d5c6e5f72e8b4d", "64f7dc7da3d5c6e5f72e8b49"],
    date: "2024-08-31T10:00:00Z",
    titleURL: "art-of-digital-design",
    likes: ["64f7dcb2a3d5c6e5f72e8b49"],
    bookmarks: ["64f7dcb2a3d5c6e5f72e8b49"],
    unicorns: [],
    comments: ["64f7dcb4a3d5c6e5f72e8b55"],
    author: "64f7dcb2a3d5c6e5f72e8b49",
  },
  {
    _id: "64f7dc8ea3d5c6e5f72e8b53",
    title: "Tech Innovations in 2024",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRN0YqBuvrUXcgJ9G3KFqJ6mJ5C3XAcgVp8WQ&s",
    body: "A look at the latest technological innovations and trends for 2024.",
    tags: [
      "64f7dc8da3d5c6e5f72e8b89",
      "64f7dc7da3d5c6e5f72e8b49",
      "64f7dc9da3d5c6e5f72e8b4c",
    ],
    date: "2024-09-01T09:30:00Z",
    titleURL: "tech-innovations-2024",
    likes: ["64f7dcb2a3d5c6e5f72e8b50"],
    bookmarks: ["64f7dcb2a3d5c6e5f72e8b50"],
    unicorns: ["64f7dca1a3d5c6e5f72e8b45"],
    comments: ["64f7dc8ea3d5c6e5f72e8b54"],
    author: "64f7dcb2a3d5c6e5f72e8b50",
  },
];

//COMMENTS MOCK DATA
const comments = [
  {
    _id: "64f7dc6ea3d5c6e5f72e8b46",
    body: "Great overview of Mongoose schemas! This will really help in structuring my projects.",
    date: "2024-08-30T09:00:00Z",
    parentPost: "64f7dc5ea3d5c6e5f72e8b40",
    parentId: null,
    author: "64f7dcb2a3d5c6e5f72e8b48",
    likes: ["64f7dcb2a3d5c6e5f72e8b48"],
  },
  {
    _id: "64f7dc6ea3d5c6e5f72e8b47",
    body: "This post on Angular techniques is very insightful. Thanks for sharing!",
    date: "2024-08-31T10:00:00Z",
    parentPost: "64f7dc5ea3d5c6e5f72e8b41",
    parentId: null,
    author: "64f7dca1a3d5c6e5f72e8b52",
    likes: ["64f7dcb2a3d5c6e5f72e8b49"],
  },
  {
    _id: "64f7dc9ea3d5c6e5f72e8b4b",
    body: "Node.js is such a powerful tool for server-side development. Excellent guide!",
    date: "2024-09-01T11:00:00Z",
    parentPost: "64f7dc9ea3d5c6e5f72e8b4a",
    parentId: null,
    author: "64f7dca1a3d5c6e5f72e8b53",
    likes: ["64f7dcb2a3d5c6e5f72e8b45"],
  },
  {
    _id: "64f7dcb4a3d5c6e5f72e8b55",
    body: "This article on user research provides great insights into improving user experience.",
    date: "2024-09-02T12:00:00Z",
    parentPost: "64f7dcb4a3d5c6e5f72e8b54",
    parentId: null,
    author: "64f7dca1a3d5c6e5f72e8b45",
    likes: ["64f7dcb2a3d5c6e5f72e8b48"],
  },
  {
    _id: "64f7dc8ea3d5c6e5f72e8b54",
    body: "Innovations in tech are fascinating! Can't wait to see how these trends evolve.",
    date: "2024-09-01T10:30:00Z",
    parentPost: "64f7dc8ea3d5c6e5f72e8b53",
    parentId: null,
    author: "64f7dcb2a3d5c6e5f72e8b48",
    likes: ["64f7dca1a3d5c6e5f72e8b45"],
  },
];

// TAGS MOCK DATA
const tags = [
  {
    _id: "64f7dc7da3d5c6e5f72e8b48",
    name: "Mongoose",
    date: "2024-08-30T07:00:00Z",
    posts: ["64f7dc5ea3d5c6e5f72e8b40"],
    followers: ["64f7dca1a3d5c6e5f72e8b45"],
  },
  {
    _id: "64f7dc8da3d5c6e5f72e8b49",
    name: "Angular",
    date: "2024-08-31T08:00:00Z",
    posts: ["64f7dc5ea3d5c6e5f72e8b41"],
    followers: ["64f7dcb2a3d5c6e5f72e8b48"],
  },
  {
    _id: "64f7dc9da3d5c6e5f72e8b4c",
    name: "Tech Trends",
    date: "2024-09-01T09:00:00Z",
    posts: ["64f7dc9ea3d5c6e5f72e8b4a"],
    followers: ["64f7dca1a3d5c6e5f72e8b52"],
  },
  {
    _id: "64f7dcada3d5c6e5f72e8b4d",
    name: "Design Thinking",
    date: "2024-09-02T10:00:00Z",
    posts: ["64f7dcb4a3d5c6e5f72e8b54"],
    followers: ["64f7dcb2a3d5c6e5f72e8b48"],
  },
  {
    _id: "64f7dc7da3d5c6e5f72e8b49",
    name: "Development",
    date: "2024-08-29T08:00:00Z",
    posts: [
      "64f7dc5ea3d5c6e5f72e8b40",
      "64f7dc7ea3d5c6e5f72e8b4a",
      "64f7dcb4a3d5c6e5f72e8b54",
    ],
    followers: ["64f7dca1a3d5c6e5f72e8b45", "64f7dcb2a3d5c6e5f72e8b48"],
  },
  {
    _id: "64f7dc8da3d5c6e5f72e8b89",
    name: "Technology",
    date: "2024-08-30T09:00:00Z",
    posts: [
      "64f7dc5ea3d5c6e5f72e8b41",
      "64f7dc9ea3d5c6e5f72e8b4a",
      "64f7dc8ea3d5c6e5f72e8b53",
    ],
    followers: ["64f7dcb2a3d5c6e5f72e8b50", "64f7dca1a3d5c6e5f72e8b52"],
  },
];

// USERS MOCK DATA
const users = [
  {
    _id: "64f7dca1a3d5c6e5f72e8b45",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    password: "12345678",
    avatar:
      "https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA4L2pvYjExMjAtZWxlbWVudC0xOS5wbmc.png",
    bio: "Software engineer with a passion for open source.",
    links: "https://github.com/alicejohnson",
    joinDate: "2023-01-15T10:30:00Z",
    location: "San Francisco, CA",
    work: "Software Engineer at TechCorp",
    skills: "JavaScript, React, Node.js",
    posts: ["64f7dc5ea3d5c6e5f72e8b40", "64f7dc5ea3d5c6e5f72e8b41"],
    comments: ["64f7dc6ea3d5c6e5f72e8b46", "64f7dc6ea3d5c6e5f72e8b47"],
    following: ["64f7dca1a3d5c6e5f72e8b46"],
    followers: ["64f7dca1a3d5c6e5f72e8b47"],
    followedTags: ["64f7dc7da3d5c6e5f72e8b48"],
    bookmarks: ["64f7dc5ea3d5c6e5f72e8b40"],
  },
  {
    _id: "64f7dcb2a3d5c6e5f72e8b48",
    name: "Bob Smith",
    email: "bob.smith@example.com",
    password: "12345678",
    avatar:
      "https://www.elitesingles.com.au/wp-content/uploads/sites/77/2020/06/profileprotectionsnap-350x264.jpg",
    bio: "Front-end developer and coffee lover.",
    links: "https://github.com/bobsmith",
    joinDate: "2023-02-10T12:00:00Z",
    location: "New York, NY",
    work: "Front-End Developer at WebWorks",
    skills: "HTML, CSS, Angular",
    posts: ["64f7dc6ea3d5c6e5f72e8b41"],
    comments: ["64f7dc7ea3d5c6e5f72e8b49"],
    following: ["64f7dca1a3d5c6e5f72e8b45"],
    followers: ["64f7dcb2a3d5c6e5f72e8b47"],
    followedTags: ["64f7dc8da3d5c6e5f72e8b49"],
    bookmarks: [],
  },
  {
    _id: "64f7dca1a3d5c6e5f72e8b52",
    name: "Charlie Davis",
    email: "charlie.davis@example.com",
    password: "12345678",
    avatar:
      "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
    bio: "Full-stack developer and tech enthusiast.",
    links: "https://charliedavis.dev",
    joinDate: "2023-03-05T10:00:00Z",
    location: "Austin, TX",
    work: "Freelancer",
    skills: "JavaScript, Node.js, Python",
    posts: ["64f7dc9ea3d5c6e5f72e8b4a"],
    comments: ["64f7dc9ea3d5c6e5f72e8b4b"],
    following: ["64f7dcb2a3d5c6e5f72e8b48"],
    followers: ["64f7dca1a3d5c6e5f72e8b45"],
    followedTags: ["64f7dc7da3d5c6e5f72e8b48"],
    bookmarks: ["64f7dc5ea3d5c6e5f72e8b40"],
  },
  {
    _id: "64f7dca1a3d5c6e5f72e8b53",
    name: "Diana Green",
    email: "diana.green@example.com",
    password: "12345678",
    avatar:
      "https://media.istockphoto.com/id/1437816897/photo/business-woman-manager-or-human-resources-portrait-for-career-success-company-we-are-hiring.jpg?s=612x612&w=0&k=20&c=tyLvtzutRh22j9GqSGI33Z4HpIwv9vL_MZw_xOE19NQ=",
    bio: "UX/UI designer with a focus on user experience.",
    links: "https://dribbble.com/dianagreen",
    joinDate: "2023-04-15T11:00:00Z",
    location: "Chicago, IL",
    work: "UX/UI Designer at CreativeAgency",
    skills: "Figma, Sketch, User Research",
    posts: ["64f7dcb4a3d5c6e5f72e8b54"],
    comments: ["64f7dcb4a3d5c6e5f72e8b55"],
    following: ["64f7dca1a3d5c6e5f72e8b52"],
    followers: ["64f7dcb2a3d5c6e5f72e8b48"],
    followedTags: ["64f7dc8da3d5c6e5f72e8b49"],
    bookmarks: ["64f7dc5ea3d5c6e5f72e8b41"],
  },
  {
    _id: "64f7dcb2a3d5c6e5f72e8b49",
    name: "Charlie Brown",
    email: "charlie.brown@example.com",
    password: "12345678",
    avatar: "https://webuildthemes.com/go/assets/images/demo/user-7.jpg",
    bio: "Graphic designer and digital artist.",
    links: "https://charliebrown.art",
    joinDate: "2023-03-05T14:30:00Z",
    location: "Austin, TX",
    work: "Freelancer",
    skills: "Photoshop, Illustrator",
    posts: ["64f7dc7ea3d5c6e5f72e8b4a"],
    comments: ["64f7dc8ea3d5c6e5f72e8b52"],
    following: ["64f7dca1a3d5c6e5f72e8b45"],
    followers: ["64f7dcb2a3d5c6e5f72e8b50"],
    followedTags: ["64f7dc8da3d5c6e5f72e8b49"],
    bookmarks: ["64f7dc7ea3d5c6e5f72e8b4a"],
  },
  {
    _id: "64f7dcb2a3d5c6e5f72e8b50",
    name: "Diana Prince",
    email: "diana.prince@example.com",
    password: "12345678",
    avatar: "https://webuildthemes.com/go/assets/images/demo/user-1.jpg",
    bio: "Product manager and tech enthusiast.",
    links: "https://linkedin.com/in/dianaprince",
    joinDate: "2023-04-20T11:00:00Z",
    location: "Seattle, WA",
    work: "Product Manager at InnovateTech",
    skills: "Product Management, UX Research",
    posts: ["64f7dc8ea3d5c6e5f72e8b53"],
    comments: ["64f7dc8ea3d5c6e5f72e8b54"],
    following: ["64f7dcb2a3d5c6e5f72e8b49"],
    followers: ["64f7dcb2a3d5c6e5f72e8b51"],
    followedTags: ["64f7dc7da3d5c6e5f72e8b48"],
    bookmarks: [],
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DB_NAME}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Database connected");

    //this would delete existing data
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Tag.deleteMany({});
    await User.deleteMany({});

    //this would inser mock data above
    await Post.insertMany(posts);
    await Comment.insertMany(comments);
    await Tag.insertMany(tags);
    await User.insertMany(users);

    console.log("Data seeded successfully");

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database", error);
    mongoose.connection.close();
  }
};

seedDatabase();

//INSTRUCTIONS
//Open new terminal -> cd to server -> run 'node seeder.js' -> this would delete existing data even your own account
