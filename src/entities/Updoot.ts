import { ObjectType, Field } from "type-graphql";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

// (m to n) many to many relationship
// why is it many to many relationship? this is between user and posts (user <-> posts)
// between user and posts, there are join table (user  -> join table <- posts) / (user -> updoot <- posts)

@Entity()
export class Updoot extends BaseEntity {
  @Column({ type: "int" })
  value: number;

  @PrimaryColumn()
  userId: number;

  @ManyToOne(() => User, (user) => user.updoots)
  user: User;

  @PrimaryColumn()
  postId: number;

  @ManyToOne(() => Post, (post) => post.updoots, {
    onDelete: "CASCADE",
  })
  post: Post;
}
