import { ApiProperty } from '@nestjs/swagger';



// ---------------- FAQs ----------------

export class FaqsResponse {
    @ApiProperty({ example: 'Does RaktoSetu certify blood safety?' })
    question!: string;

    @ApiProperty({
        example:
            'No. RaktoSetu only connects people. Hospital screening remains required.',
    })
    answer!: string;
}



// ---------------- Compatibility ----------------

export type CompatibilityResponse = Record<string, string[]>;



// ---------------- Eligibility ----------------

export class EligibilityResponse {
    @ApiProperty({ example: 18 })
    minimumAge!: number;

    @ApiProperty({ example: 90 })
    generalCooldownDays!: number;

    @ApiProperty({
        example:
            'Final donation eligibility is determined by medical staff at the hospital.',
    })
    note!: string;
}
