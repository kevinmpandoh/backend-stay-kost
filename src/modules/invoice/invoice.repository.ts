import dayjs from "dayjs";
import { BaseRepository } from "../../core/base.repository";
import { IInvoice, Invoice } from "./invoice.model";

export class InvoiceRepository extends BaseRepository<IInvoice> {
  constructor() {
    super(Invoice);
  }

  async findFirstUnpaidByBooking(bookingId: string) {
    return this.model
      .findOne({ booking: bookingId, status: "unpaid" })
      .sort({ dueDate: 1 });
  }

  async findAdminInvoicesWithFilters({
    page = 1,
    limit = 10,
    status,
    month,
    search,
    sort,
  }: {
    page?: number;
    limit?: number;
    status?: string;

    month?: string;
    search?: string;
    sort?: string;
  }) {
    if (!month || !dayjs(month, "YYYY-MM", true).isValid()) {
      month = dayjs().format("YYYY-MM");
    }

    const startDate = dayjs(month, "YYYY-MM").startOf("month").toDate();
    const endDate = dayjs(month, "YYYY-MM").endOf("month").toDate();

    const pipeline: any[] = [
      {
        $lookup: {
          from: "bookings",
          localField: "booking",
          foreignField: "_id",
          as: "booking",
        },
      },
      { $unwind: "$booking" },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $match: {
          dueDate: { $gte: startDate, $lte: endDate },
          ...(status ? { status } : {}),
        },
      },
    ];

    // 🔍 Search
    if (search) {
      const regex = new RegExp(search, "i");
      pipeline.push({
        $match: {
          $or: [
            { "user.name": regex },
            { "user.email": regex },
            { invoiceNumber: regex },
            { "booking.kost.name": regex },
            { "booking.roomType.name": regex },
          ],
        },
      });
    }

    // Project data yang diperlukan
    pipeline.push({
      $project: {
        _id: 1,
        invoiceNumber: 1,
        status: 1,
        amount: 1,
        dueDate: 1,
        createdAt: 1,
        booking: {
          _id: "$booking._id",
          kost: "$booking.kost",
          roomType: "$booking.roomType",
        },
        user: {
          _id: "$user._id",
          name: "$user.name",
          email: "$user.email",
          phone: "$user.phone",
          photo: "$user.photo",
        },
      },
    });

    // 🔽 Sorting
    if (sort === "amount_asc") {
      pipeline.push({ $sort: { amount: 1 } });
    } else if (sort === "amount_desc") {
      pipeline.push({ $sort: { amount: -1 } });
    } else if (sort === "date_asc") {
      pipeline.push({ $sort: { createdAt: 1 } });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } }); // default terbaru
    }

    // 📄 Pagination
    pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });

    // Hitung total data
    const countPipeline = [
      {
        $match: {
          dueDate: { $gte: startDate, $lte: endDate },
          ...(status ? { status } : {}),
          ...(search
            ? {
                $or: [
                  { "user.name": new RegExp(search, "i") },
                  { "user.email": new RegExp(search, "i") },
                  { invoiceNumber: new RegExp(search, "i") },
                ],
              }
            : {}),
        },
      },
      { $count: "total" },
    ];

    const [result, totalData] = await Promise.all([
      Invoice.aggregate(pipeline),
      Invoice.aggregate(countPipeline),
    ]);

    const total = totalData[0]?.total || 0;

    // Post-process
    const formatted = result.map((invoice: any) => {
      const dueDate = dayjs(invoice.dueDate);
      const now = dayjs();
      const daysDiff = dueDate.diff(now, "day");
      const isDueToday = dueDate.isSame(now, "day");
      const isLate = now.isAfter(dueDate, "day");
      const daysLate = isLate ? now.diff(dueDate, "day") : 0;

      return {
        id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        user: invoice.user,
        status: invoice.status,
        amount: invoice.amount,
        dueDate: dueDate.format("D MMMM YYYY"),
        daysRemaining: daysDiff,
        isDueToday,
        isLate,
        daysLate,
      };
    });

    return {
      data: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }
}

export const invoiceRepository = new InvoiceRepository();
