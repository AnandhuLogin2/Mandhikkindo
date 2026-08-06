import { db, admin } from '../config/firebase.js';

export const collections = {
  users: () => db.collection('users'),
  shops: () => db.collection('shops'),
  groups: () => db.collection('groups'),
  reviews: () => db.collection('reviews'),
  messages: (groupId) => db.collection('groups').doc(groupId).collection('messages'),
};

/**
 * Upsert user profile on authentication session bootstrap
 */
export const upsertUser = async (user) => {
  const userRef = collections.users().doc(user.uid);
  const doc = await userRef.get();
  const now = admin.firestore.FieldValue.serverTimestamp();

  if (!doc.exists) {
    const newUser = {
      uid: user.uid,
      displayName: user.name || 'User',
      email: user.email || '',
      photoURL: user.photoURL || '',
      createdAt: now,
      updatedAt: now,
    };
    await userRef.set(newUser);
    return { ...newUser, createdAt: new Date(), updatedAt: new Date() };
  } else {
    const updateData = {
      displayName: user.name || doc.data().displayName,
      email: user.email || doc.data().email,
      photoURL: user.photoURL || doc.data().photoURL,
      updatedAt: now,
    };
    await userRef.update(updateData);
    return { ...doc.data(), ...updateData };
  }
};

/**
 * Fetch user profile by UID
 */
export const getUserById = async (uid) => {
  const doc = await collections.users().doc(uid).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

/**
 * Search/Filter and paginate shops
 */
export const getShops = async ({ district, type, search, sort, page = 1, limit = 20 }) => {
  let query = collections.shops();

  if (district) {
    query = query.where('district', '==', district);
  }
  if (type) {
    query = query.where('types', 'array-contains', type);
  }

  // Handle sorting if specified
  if (sort === 'rating') {
    query = query.orderBy('rating', 'desc');
  } else if (sort === 'reviews') {
    query = query.orderBy('reviews', 'desc');
  } else {
    query = query.orderBy('name', 'asc');
  }

  const snapshot = await query.get();
  let results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Client-side / server in-memory filtering for text search if provided
  if (search) {
    const term = search.toLowerCase();
    results = results.filter(
      (s) =>
        (s.name && s.name.toLowerCase().includes(term)) ||
        (s.location && s.location.toLowerCase().includes(term)) ||
        (s.district && s.district.toLowerCase().includes(term))
    );
  }

  const total = results.length;
  const startIndex = (page - 1) * limit;
  const paginatedResults = results.slice(startIndex, startIndex + limit);

  return {
    data: paginatedResults,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get shop by ID
 */
export const getShopById = async (id) => {
  const doc = await collections.shops().doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

/**
 * Create a new shop
 */
export const createShop = async (shopData) => {
  const now = admin.firestore.FieldValue.serverTimestamp();
  const docRef = await collections.shops().add({
    ...shopData,
    rating: shopData.rating || 0,
    reviews: shopData.reviews || 0,
    createdAt: now,
    updatedAt: now,
  });
  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
};

/**
 * Update shop by ID
 */
export const updateShop = async (id, updateData) => {
  const docRef = collections.shops().doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return null;

  const now = admin.firestore.FieldValue.serverTimestamp();
  await docRef.update({
    ...updateData,
    updatedAt: now,
  });

  const updatedDoc = await docRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
};

/**
 * Delete shop by ID
 */
export const deleteShop = async (id) => {
  const docRef = collections.shops().doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return false;
  await docRef.delete();
  return true;
};

/**
 * Filter groups
 */
export const getGroups = async ({ district, category, date }) => {
  let query = collections.groups();

  if (district) {
    query = query.where('district', '==', district);
  }
  if (category) {
    query = query.where('category', '==', category);
  }
  if (date) {
    query = query.where('date', '==', date);
  }

  query = query.orderBy('createdAt', 'desc');

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Create group
 */
export const createGroup = async (groupData, hostUid) => {
  const now = admin.firestore.FieldValue.serverTimestamp();
  const newGroup = {
    ...groupData,
    hostUid,
    members: [hostUid],
    createdAt: now,
  };
  const docRef = await collections.groups().add(newGroup);
  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
};

/**
 * Get group by ID
 */
export const getGroupById = async (id) => {
  const doc = await collections.groups().doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

/**
 * Join group
 */
export const joinGroup = async (groupId, uid) => {
  const groupRef = collections.groups().doc(groupId);
  return db.runTransaction(async (transaction) => {
    const groupDoc = await transaction.get(groupRef);
    if (!groupDoc.exists) {
      throw { status: 404, message: 'Group not found', code: 'NOT_FOUND' };
    }
    const data = groupDoc.data();
    const members = data.members || [];

    if (members.includes(uid)) {
      throw { status: 400, message: 'User is already a member of this group', code: 'ALREADY_JOINED' };
    }
    if (members.length >= data.max) {
      throw { status: 400, message: 'Group is full', code: 'GROUP_FULL' };
    }

    const updatedMembers = [...members, uid];
    transaction.update(groupRef, { members: updatedMembers });
    return { id: groupDoc.id, ...data, members: updatedMembers };
  });
};

/**
 * Leave group
 */
export const leaveGroup = async (groupId, uid) => {
  const groupRef = collections.groups().doc(groupId);
  return db.runTransaction(async (transaction) => {
    const groupDoc = await transaction.get(groupRef);
    if (!groupDoc.exists) {
      throw { status: 404, message: 'Group not found', code: 'NOT_FOUND' };
    }
    const data = groupDoc.data();
    const members = data.members || [];

    if (!members.includes(uid)) {
      throw { status: 400, message: 'User is not a member of this group', code: 'NOT_MEMBER' };
    }

    const updatedMembers = members.filter((m) => m !== uid);
    transaction.update(groupRef, { members: updatedMembers });
    return { id: groupDoc.id, ...data, members: updatedMembers };
  });
};

/**
 * Get group messages paginated
 */
export const getGroupMessages = async (groupId, limit = 50) => {
  const snapshot = await collections
    .messages(groupId)
    .orderBy('createdAt', 'asc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Add message to group
 */
export const addGroupMessage = async (groupId, { text, authorUid, authorName }) => {
  const now = admin.firestore.FieldValue.serverTimestamp();
  const messageData = {
    text,
    authorUid,
    authorName,
    createdAt: now,
  };
  const docRef = await collections.messages(groupId).add(messageData);
  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
};

/**
 * Get reviews for a shop
 */
export const getReviewsByShopId = async (shopId) => {
  const snapshot = await collections
    .reviews()
    .where('shopId', '==', shopId)
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Create review and recompute shop rating & review count atomically using transaction
 */
export const createReviewTransaction = async ({ shopId, authorUid, authorName, rating, text }) => {
  const shopRef = collections.shops().doc(shopId);
  const reviewRef = collections.reviews().doc();

  return db.runTransaction(async (transaction) => {
    const shopDoc = await transaction.get(shopRef);
    if (!shopDoc.exists) {
      throw { status: 404, message: 'Shop not found', code: 'NOT_FOUND' };
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const newReview = {
      shopId,
      authorUid,
      authorName,
      rating,
      text,
      createdAt: now,
    };

    transaction.set(reviewRef, newReview);

    // Fetch all reviews for recalculation
    const reviewsSnapshot = await collections().reviews().where('shopId', '==', shopId).get();
    let totalRating = rating;
    let count = 1;

    reviewsSnapshot.forEach((doc) => {
      totalRating += doc.data().rating;
      count += 1;
    });

    const averageRating = parseFloat((totalRating / count).toFixed(1));

    transaction.update(shopRef, {
      rating: averageRating,
      reviews: count,
      updatedAt: now,
    });

    return {
      review: { id: reviewRef.id, ...newReview },
      updatedShop: { rating: averageRating, reviews: count },
    };
  });
};

/**
 * Delete review and recompute shop rating & review count
 */
export const deleteReviewTransaction = async (reviewId, userUid) => {
  const reviewRef = collections.reviews().doc(reviewId);

  return db.runTransaction(async (transaction) => {
    const reviewDoc = await transaction.get(reviewRef);
    if (!reviewDoc.exists) {
      throw { status: 404, message: 'Review not found', code: 'NOT_FOUND' };
    }

    const reviewData = reviewDoc.data();
    if (reviewData.authorUid !== userUid) {
      throw { status: 403, message: 'You can only delete your own reviews', code: 'FORBIDDEN' };
    }

    const shopRef = collections.shops().doc(reviewData.shopId);
    const shopDoc = await transaction.get(shopRef);

    transaction.delete(reviewRef);

    if (shopDoc.exists) {
      const reviewsSnapshot = await collections().reviews().where('shopId', '==', reviewData.shopId).get();
      let totalRating = 0;
      let count = 0;

      reviewsSnapshot.forEach((doc) => {
        if (doc.id !== reviewId) {
          totalRating += doc.data().rating;
          count += 1;
        }
      });

      const averageRating = count > 0 ? parseFloat((totalRating / count).toFixed(1)) : 0;
      const now = admin.firestore.FieldValue.serverTimestamp();

      transaction.update(shopRef, {
        rating: averageRating,
        reviews: count,
        updatedAt: now,
      });
    }

    return true;
  });
};
