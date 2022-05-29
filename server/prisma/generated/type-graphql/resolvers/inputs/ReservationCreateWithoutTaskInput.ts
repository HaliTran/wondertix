import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { CustomersCreateNestedOneWithoutReservationInput } from "../inputs/CustomersCreateNestedOneWithoutReservationInput";

@TypeGraphQL.InputType("ReservationCreateWithoutTaskInput", {
  isAbstract: true
})
export class ReservationCreateWithoutTaskInput {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  eventid?: number | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  eventname?: string | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  eventdate?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  showtime?: Date | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  numtickets?: number | undefined;

  @TypeGraphQL.Field(_type => CustomersCreateNestedOneWithoutReservationInput, {
    nullable: true
  })
  customers?: CustomersCreateNestedOneWithoutReservationInput | undefined;
}
