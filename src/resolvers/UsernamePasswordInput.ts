import { InputType, Field } from "type-graphql";

@InputType()
export class UsernamePasswordInput {
  @Field()
  email: string;
  @Field()
  username: string;
  //explicitly set / or to overwrite the type
  @Field()
  password: string;
}
