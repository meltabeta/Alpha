// Firebase configuration and initialization
const firebaseConfig = {
  apiKey: "AIzaSyAyVzoSJAhb63WbAbjSRVRrIRGGifN9AeI",
  authDomain: "movieflix-c8223.firebaseapp.com",
  databaseURL: "https://movieflix-c8223-default-rtdb.firebaseio.com",
  projectId: "movieflix-c8223",
  storageBucket: "movieflix-c8223.firebasestorage.app",
  messagingSenderId: "745071272054",
  appId: "1:745071272054:web:01021955f18bf87a997f57",
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Firebase service class
class FirebaseService {
  constructor() {
    this.database = firebase.database();
  }

  // Comments related methods
  async loadComments(page = 1, commentsPerPage) {
    try {
      // Get all comments ordered by timestamp
      const snapshot = await this.database
        .ref("comments")
        .orderByChild("timestamp")
        .once("value");

      const totalComments = snapshot.numChildren();
      const comments = [];

      // Convert snapshot to array and reverse for newest first
      snapshot.forEach((childSnapshot) => {
        comments.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });

      // Sort by timestamp descending (newest first)
      comments.sort((a, b) => b.timestamp - a.timestamp);

      // Calculate pagination
      const startIndex = (page - 1) * commentsPerPage;
      const paginatedComments = comments.slice(
        startIndex,
        startIndex + commentsPerPage
      );

      return {
        comments: paginatedComments,
        totalComments,
      };
    } catch (error) {
      console.error("Error loading comments:", error);
      throw error;
    }
  }

  async loadRecentComments(limit = 5) {
    try {
      const snapshot = await this.database
        .ref("comments")
        .orderByChild("timestamp")
        .limitToLast(limit)
        .once("value");

      const comments = [];
      snapshot.forEach((childSnapshot) => {
        // Add each comment to beginning of array for reverse chronological order
        comments.unshift({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });

      return comments;
    } catch (error) {
      console.error("Error loading recent comments:", error);
      throw error;
    }
  }

  async submitComment(comment) {
    try {
      return await this.database.ref("comments").push({
        ...comment,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
      throw error;
    }
  }

  // Cards/Items related methods
  async loadAllItems() {
    try {
      const snapshot = await this.database.ref("/cards").once("value");
      const data = snapshot.val();

      if (!data) {
        throw new Error("No data available");
      }

      return Object.values(data).sort(
        (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)
      );
    } catch (error) {
      console.error("Error loading items:", error);
      throw error;
    }
  }
}

// Export a single instance
export default new FirebaseService();
