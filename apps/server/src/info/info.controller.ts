import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiRoute } from '../common/decorators/api-route.decorator';
import { EligibilityInfoDto, FaqItemDto } from '../common/dto/api-response.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Info')
@Public()
@Controller('info')
export class InfoController {

    // ---------------- FAQs ----------------

    @Get('faqs')
    @ApiRoute({
        summary: 'Get blood donation FAQs',
        auth: false,
        responseType: FaqItemDto,
        responseIsArray: true,
    })
    faqs() {
        return [
            {
                question: 'Does RaktoSetu certify blood safety?',
                answer: 'No. RaktoSetu only connects people. Hospital screening and cross-matching remain required.',
            },
            {
                question: 'When are contact details shared?',
                answer: 'Only after a donor accepts a specific blood request.',
            },
        ];
    }


    // ---------------- Compatibility ----------------

    @Get('compatibility')
    @ApiRoute({
        summary: 'Get blood group compatibility chart',
        auth: false,
        dataSchema: {
            type: 'object',
            additionalProperties: {
                type: 'array',
                items: { type: 'string' },
            },
        },
    })
    compatibility() {
        return {
            'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
            'O+': ['O+', 'A+', 'B+', 'AB+'],
            'A-': ['A-', 'A+', 'AB-', 'AB+'],
            'A+': ['A+', 'AB+'],
            'B-': ['B-', 'B+', 'AB-', 'AB+'],
            'B+': ['B+', 'AB+'],
            'AB-': ['AB-', 'AB+'],
            'AB+': ['AB+'],
        };
    }


    // ---------------- Eligibility ----------------

    @Get('eligibility')
    @ApiRoute({
        summary: 'Get donation eligibility criteria',
        auth: false,
        responseType: EligibilityInfoDto,
    })
    eligibility() {
        return {
            minimumAge: 18,
            generalCooldownDays: 90,
            note: 'Final donation eligibility is determined by medical staff at the hospital.',
        };
    }
}
