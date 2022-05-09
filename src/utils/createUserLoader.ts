import DataLoader from "dataLoader";
import { User } from "../entities/User";

// userIds is going to be like an array ,  etc [1,78,8,9]
// [{id: 1, username: 'tim'},{},{},{}]

export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[]);
    const userIdToUser: Record<number, User> = {};
    users.forEach((u) => {
      userIdToUser[u.id] = u;
    });

    return userIds.map((userId) => userIdToUser[userId]);
  });
