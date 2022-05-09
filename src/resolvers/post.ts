// // // import { Post } from "../entities/Post";
// // // import {
// // //   Resolver,
// // //   Query,
// // //   Arg,
// // //   Mutation,
// // //   InputType,
// // //   Field,
// // //   Ctx,
// // // } from "type-graphql";
// // // import { MyContext } from "../types";

// // // @InputType()
// // // class PostInput {
// // //   @Field()
// // //   title: string;
// // //   @Field()
// // //   text: string;
// // // }
// // // @Resolver()
// // // export class PostResolver {
// // //   @Query(() => [Post])

// // //   // return array of post
// // //   async posts(): Promise<Post[]> {
// // //     // // mikroORM
// // //     // return em.find(Post, {});
// // //     // // typeORM
// // //     return Post.find();
// // //   }

// // //   //getting data
// // //   @Query(() => Post, { nullable: true })
// // //   post(
// // //     // take arguement, in graphql is arg
// // //     @Arg("id") id: number
// // //   ): Promise<Post | undefined> {
// // //     // // mikroORM
// // //     // return em.findOne(Post, { id });
// // //     // // typeORM
// // //     return Post.findOne(id);
// // //   }

// // //   //creating, inserting, & deleting
// // //   @Mutation(() => Post)
// // //   async createPost(
// // //     @Arg("input") input: PostInput,
// // //     @Ctx() { req }: MyContext
// // //   ): Promise<Post> {
// // //     if (!req.session.userId) {
// // //       throw new Error("not authenticated");
// // //     }
// // //     // 2 sql queries
// // //     return Post.create({ ...input, creatorId: req.session.userId }).save();
// // //   }

// // //   //updating
// // //   @Mutation(() => Post, { nullable: true })
// // //   async updatePost(
// // //     @Arg("id") id: number,
// // //     @Arg("title", () => String, { nullable: true }) title: string
// // //   ): Promise<Post | null> {
// // //     // fetch post
// // //     const post = await Post.findOne(id);
// // //     if (!post) {
// // //       return null;
// // //     }
// // //     // update post
// // //     if (typeof title !== "undefined") {
// // //       await Post.update({ id }, { title });
// // //     }
// // //     return post;
// // //   }

// // //   //deleting
// // //   @Mutation(() => Boolean)
// // //   async deletePost(@Arg("id") id: number): Promise<boolean> {
// // //     await Post.delete(id);
// // //     return true;
// // //   }
// // // }

// // import {
// //   Resolver,
// //   Query,
// //   Arg,
// //   Mutation,
// //   InputType,
// //   Field,
// //   Ctx,
// //   UseMiddleware,
// //   Int,
// //   FieldResolver,
// //   Root,
// //   ObjectType,
// // } from "type-graphql";
// // import { Post } from "../entities/Post";
// // import { MyContext } from "../types";
// // import { isAuth } from "../middleware/isAuth";
// // import { getConnection, UpdateDateColumn } from "typeorm";
// // import { rootCertificates } from "tls";
// // import { getFieldDef } from "graphql/execution/execute";
// // import { Updoot } from "../entities/Updoot";
// // import e from "express";

// // @InputType()
// // class PostInput {
// //   @Field()
// //   title: string;
// //   @Field()
// //   text: string;
// // }

// // @ObjectType()
// // class PaginatedPosts {
// //   @Field(() => [Post])
// //   posts: Post[];
// //   @Field()
// //   hasMore: boolean; // whether has more item in this list
// // }

// // @Resolver(Post)
// // export class PostResolver {
// //   @FieldResolver(() => String)
// //   textSnippet(@Root() root: Post) {
// //     return root.text.slice(0, 50);
// //   }

// //   @Mutation(() => Boolean)
// //   @UseMiddleware(isAuth)
// //   async vote(
// //     @Arg("postId", () => Int) postId: number,
// //     @Arg("value", () => Int) value: number,
// //     @Ctx() { req }: MyContext
// //   ) {
// //     const isUpdoot = value !== -1;
// //     const realValue = isUpdoot ? 1 : -1;
// //     const { userId } = req.session;
// //     const updoot = await Updoot.findOne({ where: { postId, userId } });

// //     if (updoot && updoot.value !== realValue) {
// //       //the user has voted on the post before
// //       //and they are changing their vote
// //       await getConnection().transaction(async (tm) => {
// //         await tm.query(
// //           `
// //           update updoot
// //           set value = $1
// //           where "postId" = $2 and "userId" = $3
// //           `,
// //           [realValue, postId, userId]
// //         );
// //         await tm.query(
// //           `
// //           update post
// //           set points = points + $1
// //           where id = $2
// //           `,
// //           [2 * realValue, postId]
// //         );
// //       });
// //     } else if (!updoot) {
// //       //has never voted before
// //       await getConnection().transaction(async (tm) => {
// //         await tm.query(
// //           `
// //           insert into updoot ("userId", "postId", value)
// //           values ($1, $2, $3)
// //           `,
// //           [userId, postId, realValue]
// //         );

// //         await tm.query(
// //           `update post
// //           set points = points + $1
// //           where id = $2
// //           `,
// //           [realValue, postId]
// //         );
// //       });
// //     }
// //     // await Updoot.insert({
// //     //   userId,
// //     //   postId,
// //     //   value: realValue,
// //     // });
// //     // sql syntax
// //     return true;
// //   }

// //   @Query(() => PaginatedPosts)
// //   async posts(
// //     //pagination
// //     @Arg("limit", () => Int) limit: number,
// //     // nullable, need to explicitly type out the type
// //     @Arg("cursor", () => String, { nullable: true }) cursor: string | null
// //   ): Promise<PaginatedPosts> {
// //     // 20 -> 21
// //     const realLimit = Math.min(50, limit);
// //     const reaLimitPlusOne = realLimit + 1;

// //     const replacements: any[] = [reaLimitPlusOne];

// //     if (cursor) {
// //       replacements.push(new Date(parseInt(cursor)));
// //     }

// //     const posts = await getConnection().query(
// //       `
// //     select p.*,
// //     json_build_object(
// //       'id', u.id,
// //       'username', u.username,
// //       'email', u.email,
// //       'createdAt', u."createdAt",
// //       'updatedAt', u."updatedAt"
// //       ) creator
// //     from post p
// //     inner join public.user u on u.id = p."creatorId"
// //     ${cursor ? `where p."createdAt" < $2` : ""}
// //     order by p."createdAt" DESC
// //     limit $1
// //     `,
// //       replacements
// //     );

// //     // const qb = getConnection()
// //     //   .getRepository(Post)
// //     //   .createQueryBuilder("p")
// //     //   .innerJoinAndSelect("p.creator", "u", 'u.id = p."creatorId"')
// //     //   .orderBy('p."createdAt"', "DESC")
// //     //   .take(reaLimitPlusOne);

// //     // if (cursor) {
// //     //   qb.where('p."createdAt" < :cursor', {
// //     //     cursor: new Date(parseInt(cursor)),
// //     //   });
// //     // }

// //     // const posts = await qb.getMany();
// //     // console.log("posts: ", posts);

// //     return {
// //       posts: posts.slice(0, realLimit),
// //       hasMore: posts.length === reaLimitPlusOne,
// //     };
// //   }

// //   @Query(() => Post, { nullable: true })
// //   post(@Arg("id") id: number): Promise<Post | undefined> {
// //     return Post.findOne(id);
// //   }

// //   @Mutation(() => Post)
// //   @UseMiddleware(isAuth)
// //   async createPost(
// //     @Arg("input") input: PostInput,
// //     @Ctx() { req }: MyContext
// //   ): Promise<Post> {
// //     return Post.create({
// //       ...input,
// //       creatorId: req.session.userId,
// //     }).save();
// //   }

// //   @Mutation(() => Post, { nullable: true })
// //   async updatePost(
// //     @Arg("id") id: number,
// //     @Arg("title", () => String, { nullable: true }) title: string
// //   ): Promise<Post | null> {
// //     const post = await Post.findOne(id);
// //     if (!post) {
// //       return null;
// //     }
// //     if (typeof title !== "undefined") {
// //       await Post.update({ id }, { title });
// //     }
// //     return post;
// //   }

// //   @Mutation(() => Boolean)
// //   async deletePost(@Arg("id") id: number): Promise<boolean> {
// //     await Post.delete(id);
// //     return true;
// //   }
// // }

// import {
//   Resolver,
//   Query,
//   Arg,
//   Mutation,
//   InputType,
//   Field,
//   Ctx,
//   UseMiddleware,
//   Int,
//   FieldResolver,
//   Root,
//   ObjectType,
//   Info,
// } from "type-graphql";
// import { Post } from "../entities/Post";
// import { MyContext } from "../types";
// import { isAuth } from "../middleware/isAuth";
// import { getConnection } from "typeorm";
// import { Updoot } from "../entities/Updoot";
// import { tmpdir } from "os";

// @InputType()
// class PostInput {
//   @Field()
//   title: string;
//   @Field()
//   text: string;
// }

// @ObjectType()
// class PaginatedPosts {
//   @Field(() => [Post])
//   posts: Post[];
//   @Field()
//   hasMore: boolean;
// }

// @Resolver(Post)
// export class PostResolver {
//   @FieldResolver(() => String)
//   textSnippet(@Root() post: Post) {
//     return post.text.slice(0, 50);
//   }

//   @Mutation(() => Boolean)
//   @UseMiddleware(isAuth)
//   async vote(
//     @Arg("postId", () => Int) postId: number,
//     @Arg("value", () => Int) value: number,
//     @Ctx() { req }: MyContext
//   ) {
//     const isUpdoot = value !== -1;
//     const realValue = isUpdoot ? 1 : -1;
//     const { userId } = req.session;

//     const updoot = await Updoot.findOne({ where: { postId, userId } });

//     // the user has voted on the post before
//     // and they are changing their vote
//     if (updoot && updoot.value !== realValue) {
//       await getConnection().transaction(async (tm) => {
//         await tm.query(
//           `
//     update updoot
//     set value = $1
//     where "postId" = $2 and "userId" = $3
//         `,
//           [realValue, postId, userId]
//         );

//         await tm.query(
//           `
//           update post
//           set points = points + $1
//           where id = $2
//         `,
//           [2 * realValue, postId]
//         );
//       });
//     } else if (!updoot) {
//       // has never voted before
//       await getConnection().transaction(async (tm) => {
//         await tm.query(
//           `
//     insert into updoot ("userId", "postId", value)
//     values ($1, $2, $3)
//         `,
//           [userId, postId, realValue]
//         );

//         await tm.query(
//           `
//     update post
//     set points = points + $1
//     where id = $2
//       `,
//           [realValue, postId]
//         );
//       });
//     }
//     return true;
//   }

//   @Query(() => PaginatedPosts)
//   async posts(
//     @Arg("limit", () => Int) limit: number,
//     @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
//     @Ctx() { req }: MyContext
//   ): Promise<PaginatedPosts> {
//     // 20 -> 21
//     const realLimit = Math.min(50, limit);
//     const reaLimitPlusOne = realLimit + 1;

//     const replacements: any[] = [reaLimitPlusOne, req.session.userId];

//     if (cursor) {
//       replacements.push(new Date(parseInt(cursor)));
//     }

//     const posts = await getConnection().query(
//       `
//     select p.*,
//     json_build_object(
//       'id', u.id,
//       'username', u.username,
//       'email', u.email,
//       'createdAt', u."createdAt",
//       'updatedAt', u."updatedAt"
//       ) creator,
//     ${
//       req.session.userId
//         ? ',(select value from updoot where "userId" =  $2 and "postId" = p.id) "voteStatus"'
//         : 'null as "voteStatus" '
//     }
//     from post p
//     inner join public.user u on u.id = p."creatorId"
//     ${cursor ? `where p."createdAt" < $3` : ""}
//     order by p."createdAt" DESC
//     limit $1
//     `,
//       replacements
//     );

//     // const qb = getConnection()
//     //   .getRepository(Post)
//     //   .createQueryBuilder("p")
//     //   .innerJoinAndSelect("p.creator", "u", 'u.id = p."creatorId"')
//     //   .orderBy('p."createdAt"', "DESC")
//     //   .take(reaLimitPlusOne);

//     // if (cursor) {
//     //   qb.where('p."createdAt" < :cursor', {
//     //     cursor: new Date(parseInt(cursor)),
//     //   });
//     // }

//     // const posts = await qb.getMany();
//     // console.log("posts: ", posts);

//     return {
//       posts: posts.slice(0, realLimit),
//       hasMore: posts.length === reaLimitPlusOne,
//     };
//   }

//   @Query(() => Post, { nullable: true })
//   post(@Arg("id") id: number): Promise<Post | undefined> {
//     return Post.findOne(id);
//   }

//   @Mutation(() => Post)
//   @UseMiddleware(isAuth)
//   async createPost(
//     @Arg("input") input: PostInput,
//     @Ctx() { req }: MyContext
//   ): Promise<Post> {
//     return Post.create({
//       ...input,
//       creatorId: req.session.userId,
//     }).save();
//   }

//   @Mutation(() => Post, { nullable: true })
//   async updatePost(
//     @Arg("id") id: number,
//     @Arg("title", () => String, { nullable: true }) title: string
//   ): Promise<Post | null> {
//     const post = await Post.findOne(id);
//     if (!post) {
//       return null;
//     }
//     if (typeof title !== "undefined") {
//       await Post.update({ id }, { title });
//     }
//     return post;
//   }

//   @Mutation(() => Boolean)
//   async deletePost(@Arg("id") id: number): Promise<boolean> {
//     await Post.delete(id);
//     return true;
//   }
// }

import {
  Resolver,
  Query,
  Arg,
  Mutation,
  InputType,
  Field,
  Ctx,
  UseMiddleware,
  Int,
  FieldResolver,
  Root,
  ObjectType,
  Info,
} from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { Updoot } from "../entities/Updoot";
import { User } from "../entities/User";
@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() post: Post) {
    return post.text.slice(0, 50);
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { updootLoader, req }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }
    const updoot = await updootLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });

    return updoot ? updoot.value : null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const { userId } = req.session;

    const updoot = await Updoot.findOne({ where: { postId, userId } });

    // the user has voted on the post before
    // and they are changing their vote
    if (updoot && updoot.value !== realValue) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
    update updoot
    set value = $1
    where "postId" = $2 and "userId" = $3
        `,
          [realValue, postId, userId]
        );

        await tm.query(
          `
          update post
          set points = points + $1
          where id = $2
        `,
          [2 * realValue, postId]
        );
      });
    } else if (!updoot) {
      // has never voted before
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
    insert into updoot ("userId", "postId", value)
    values ($1, $2, $3)
        `,
          [userId, postId, realValue]
        );

        await tm.query(
          `
    update post
    set points = points + $1
    where id = $2
      `,
          [realValue, postId]
        );
      });
    }
    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    // 20 -> 21
    const realLimit = Math.min(50, limit);
    const reaLimitPlusOne = realLimit + 1;

    const replacements: any[] = [reaLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await getConnection().query(
      `
    select p.*
    from post p
    ${cursor ? `where p."createdAt" < $2` : ""}
    order by p."createdAt" DESC
    limit $1
    `,
      replacements
    );

    // const qb = getConnection()
    //   .getRepository(Post)
    //   .createQueryBuilder("p")
    //   .innerJoinAndSelect("p.creator", "u", 'u.id = p."creatorId"')
    //   .orderBy('p."createdAt"', "DESC")
    //   .take(reaLimitPlusOne);

    // if (cursor) {
    //   qb.where('p."createdAt" < :cursor', {
    //     cursor: new Date(parseInt(cursor)),
    //   });
    // }

    // const posts = await qb.getMany();
    // console.log("posts: ", posts);

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === reaLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id= :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    // not cascade way
    // const post = await Post.findOne(id);
    // if (!post) {
    //   return false;
    // }
    // if (post.creatorId !== req.session.userId) {
    //   throw new Error("not authorized");
    // }
    // await Updoot.delete({ postId: id });
    // await Post.delete({ id, creatorId: req.session.userId });

    //cascade
    await Post.delete({ id, creatorId: req.session.userId });

    return true;
  }
}
