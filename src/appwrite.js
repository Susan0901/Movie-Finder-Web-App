import { Client, Databases, ID, Query } from "appwrite";

const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const APPWRITE_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
  .setEndpoint("https://syd.cloud.appwrite.io/v1")
  .setProject(APPWRITE_PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
  try {
    const result = await database.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID,
      [Query.equal("searchTerm", searchTerm)]
    );

    if (result.documents.length > 0) {
      const doc = result.documents[0];

      await database.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_COLLECTION_ID,
        doc.$id,
        {
          count: doc.count + 1,
        }
      );
    } else {
      await database.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_COLLECTION_ID,
        ID.unique(),
        {
          count: 1,
          searchTerm,
          movie_id: movie.id,
          poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        }
      );
    }
  } catch (error) {
    console.error(error);
  }
};

export const getTrendingMovies = async () => {
  try {
    const result = await database.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID,
      [Query.limit(5), Query.orderDesc("count")]
    );

    return result.documents;
  } catch (error) {
    console.error(error);
  }
};
""
export { APPWRITE_COLLECTION_ID, APPWRITE_DATABASE_ID, APPWRITE_PROJECT_ID };
