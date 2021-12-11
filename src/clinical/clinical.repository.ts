import { set, subDays, add, subHours } from 'date-fns';
import {
  Between,
  EntityRepository,
  Like,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { GetListRepositoryDto } from './dto/Query.dto';
import { Clinical } from './entities/clinical.entity';

@EntityRepository(Clinical)
export class ClinicalRepository extends Repository<Clinical> {
  async getListClinical(
    query: GetListRepositoryDto,
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
      let UTCZeroApprovalTime = new Date(query.APPROVAL_TIME);
      if (query.NODE_ENV !== 'production') {
        UTCZeroApprovalTime = subHours(UTCZeroApprovalTime, 9);
      }
      const datePeriod = [
        UTCZeroApprovalTime.toISOString(),
        add(UTCZeroApprovalTime, {
          hours: 23,
          minutes: 59,
          seconds: 59,
        }).toISOString(),
      ];

      Object.assign(whereOption, {
        APPROVAL_TIME: Between(datePeriod[0], datePeriod[1]),
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
