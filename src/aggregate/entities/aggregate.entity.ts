import { ApiProperty } from '@nestjs/swagger';

/** Aggregated values of the satellite's altitude within a time constraint */
export class Aggregate {
  /** Minimum altitude */
  @ApiProperty({
    example: 0,
    description: "The minimum value of the satellite's altitude within the expected time contraint",
  })
  min: number;

  /** Maximum altitude */
  @ApiProperty({
    example: 320,
    description: "The maximum value of the satellite's altitude within the expected time contraint",
  })
  max: number;

  /** Average altitude */
  @ApiProperty({
    example: 160,
    description: "The average value of the satellite's altitude within the expected time contraint",
  })
  avg: number;
}
