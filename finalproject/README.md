# Web Development Final Project - _AirFryHub_

Submitted by: **Olatomiwa Aluko**

This web app: **A modern, feature-rich air fryer recipe and tips forum that allows users to share recipes, cooking tips, and food photos with the community. Built with React, TypeScript, Tailwind CSS, and Supabase, featuring a clean modern design inspired by platforms like Vercel, Linear, and Stripe.**

Time spent: **25** hours spent in total

## Required Features

The following **required** functionality is completed:

- [x] **Web app includes a create form that allows the user to create posts**
  - Form requires users to add a post title
  - Forms should have the _option_ for users to add:
    - additional textual content
    - an image added as an external image URL
- [x] **Web app includes a home feed displaying previously created posts**
  - Web app must include home feed displaying previously created posts
  - By default, each post on the posts feed should show only the post's:
    - creation time
    - title
    - upvotes count
  - Clicking on a post should direct the user to a new page for the selected post
- [x] **Users can view posts in different ways**
  - Users can sort posts by either:
    - creation time
    - upvotes count
  - Users can search for posts by title
- [x] **Users can interact with each post in different ways**

  - The app includes a separate post page for each created post when clicked, where any additional information is shown, including:
    - content
    - image
    - comments
  - Users can leave comments underneath a post on the post page
  - Each post includes an upvote button on the post page.
    - Each click increases the post's upvotes count by one
    - Users can upvote any post any number of times

- [x] **A post that a user previously created can be edited or deleted from its post pages**
  - After a user creates a new post, they can go back and edit the post
  - A previously created post can be deleted from its post page

The following **optional** features are implemented:

- [ ] Web app implements pseudo-authentication
  - Users can only edit and delete posts or delete comments by entering the secret key, which is set by the user during post creation
  - **or** upon launching the web app, the user is assigned a random user ID. It will be associated with all posts and comments that they make and displayed on them
  - For both options, only the original user author of a post can update or delete it
- [x] Users can repost a previous post by referencing its post ID. On the post page of the new post
  - Users can repost a previous post by referencing its post ID
  - On the post page of the new post, the referenced post is displayed and linked, creating a thread
- [x] Users can customize the interface
  - e.g., selecting the color scheme or showing the content and image of each post on the home feed
- [x] Users can add more characterics to their posts
  - Users can share and view web videos
  - Users can set flags such as "Question" or "Opinion" while creating a post
  - Users can filter posts by flags on the home feed
  - Users can upload images directly from their local machine as an image file
- [x] Web app displays a loading animation whenever data is being fetched

The following **additional** features are implemented:

- [x] **Real-time updates using Supabase subscriptions** - Posts update automatically when new content is added
- [x] **Anonymous authentication system** - Users can participate without creating accounts
- [x] **Advanced image upload with Supabase Storage** - Direct file uploads with preview functionality
- [x] **Link preview generation** - Automatic previews for external URLs in posts
- [x] **Modern responsive design** - Built with Tailwind CSS v4 and TypeScript for type safety
- [x] **Input validation with Zod** - Comprehensive form validation and error handling
- [x] **User profile customization** - Customizable display names and user preferences
- [x] **Pagination system** - Efficient loading of large post collections
- [x] **Advanced search functionality** - Search across titles and content with real-time results

## Video Walkthrough

Here's a walkthrough of implemented user stories:

<img src='http://i.imgur.com/link/to/your/gif/file.gif' title='Video Walkthrough' width='' alt='Video Walkthrough' />

<!-- Replace this with whatever GIF tool you used! -->

GIF created with ...

<!-- Recommended tools:
[Kap](https://getkap.co/) for macOS
[ScreenToGif](https://www.screentogif.com/) for Windows
[peek](https://github.com/phw/peek) for Linux. -->

## Notes

### Development Challenges and Solutions

During the development of this social media platform, several technical challenges were encountered and resolved:

**1. Modern UI Framework Integration**

- **Challenge**: Integrating Tailwind CSS v4 with React + TypeScript + Vite while maintaining type safety
- **Solution**: Configured proper PostCSS and TypeScript definitions, created custom theme extensions for consistent design system

**2. Real-time Data Management**

- **Challenge**: Implementing real-time updates without performance degradation
- **Solution**: Used Supabase real-time subscriptions with efficient state management and optimistic updates

**3. Anonymous Authentication System**

- **Challenge**: Balancing user experience with data integrity for anonymous users
- **Solution**: Implemented Supabase anonymous auth with session persistence and graceful user migration paths

**4. Image Upload and Storage**

- **Challenge**: Handling file uploads with preview, validation, and storage management
- **Solution**: Integrated Supabase Storage with custom upload components, image compression, and error handling

**5. Complex Filtering and Search**

- **Challenge**: Building performant search across multiple fields with real-time filtering
- **Solution**: Implemented PostgreSQL full-text search with indexed queries and debounced input handling

**6. Theme System Architecture**

- **Challenge**: Creating a robust dark/light theme system that persists across sessions
- **Solution**: Built custom React context with localStorage persistence and CSS variable-based theming

**7. Form Validation and Error Handling**

- **Challenge**: Consistent validation across multiple forms with user-friendly error messages
- **Solution**: Implemented Zod schema validation with custom error formatting and real-time validation feedback

The project demonstrates modern React development practices including TypeScript for type safety, custom hooks for state management, and component composition for maintainable code architecture.

## License

    Copyright [2025] [Olatomiwa Aluko]

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
