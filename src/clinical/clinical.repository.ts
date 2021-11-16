import { addHours, set, subDays, subHours } from 'date-fns';
import {
  Between,
  EntityRepository,
  Like,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { QueryDto } from './dto/Query.dto';
import { Clinical } from './entities/clinical.entity';

@EntityRepository(Clinical)
export class ClinicalRepository extends Repository<Clinical> {
  async getListClinical(
    query: QueryDto,
  ): Promise<{ data: Clinical[]; count: number }> {
    const limit = 10;
    const offset = query.page ? (Number(query.page) - 1) * limit : 0;
    const conditions = [
      'GOODS_NAME',
      'LAB_NAME',
      'APPLY_ENTP_NAME',
      'CLINIC_EXAM_TITLE',
    ];
    const whereOption = {};
    conditions.forEach((el) => {
      if (query[el]) {
        Object.assign(whereOption, { [`${el}`]: Like(`%${query[el]}%`) });
      }
    });

    if (query.step) {
      Object.assign(whereOption, {
        step: { name: Like(`%${query.step}%`) },
      });
    }

    if (query.APPROVAL_TIME) {
      Object.assign(whereOption, {
        APPROVAL_TIME: Between(
          subDays(subHours(new Date(query.APPROVAL_TIME), 9), 1).toISOString(),
          subDays(addHours(new Date(query.APPROVAL_TIME), 15), 1).toISOString(),
        ),
      });
    } else {
      Object.assign(whereOption, {
        APPROVAL_TIME: MoreThanOrEqual(
          subDays(
            set(new Date(), {
              hours: 0,
              minutes: 0,
              seconds: 0,
              milliseconds: 0,
            }),
            6,
          ).toISOString(),
        ),
      });
    }
    const [data, count] = await this.findAndCount({
      where: whereOption,
      relations: ['step'],
      skip: offset,
      take: limit,
    });
    return { count, data };
  }
}
