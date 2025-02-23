import {Router, Request, Response} from 'express';
import {checkJwt, checkScopes} from '../auth';
import {Prisma} from '@prisma/client';
import {extendPrismaClient} from './PrismaClient/GetExtendedPrismaClient';

const prisma = extendPrismaClient();

export const ticketRestrictionController = Router();
/**
 * @swagger
 * /2/ticket-restriction:
 *   get:
 *     summary: get all Ticket Restrictions for which there are tickets available
 *     tags:
 *     - New Ticket Restrictions
 *     responses:
 *       200:
 *         description: fetch successful
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               $ref: '#/components/schemas/TicketRestriction'
 *       400:
 *         description: bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message from the server.
 *       500:
 *         description: Internal Server Error. An error occurred while processing the request.
 */
ticketRestrictionController.get('/', async (req: Request, res: Response) => {
  try {
    const ticketRestrictions = await prisma.ticketrestrictions.findMany({
      where: {
        eventinstances: {
          deletedat: null,
          availableseats: {gt: 0},
          events: {
            active: true,
          },
        },
        eventtickets: {
          some: {
            singleticket_fk: null,
          },
        },
      },
      include: {
        eventtickets: {
          where: {
            singleticket_fk: {not: null},
          },
        },
        tickettype: {
          select: {
            description: true,
          },
        },
      },
    });
    return res.json(
        ticketRestrictions
            .map((restriction) => ({
              id: restriction.ticketrestrictionsid,
              eventinstanceid: restriction.eventinstanceid_fk,
              tickettypeid: restriction.tickettypeid_fk,
              description: restriction.tickettype.description,
              concessionprice: +restriction.concessionprice,
              price: +restriction.price,
              ticketlimit: restriction.ticketlimit,
              ticketssold: restriction.eventtickets.length,
            })));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(400).json({error: error.message});
      return;
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      res.status(400).json({error: error.message});
      return;
    }
    res.status(500).json({error: 'Internal Server Error'});
  }
});

/**
 * @swagger
 * /2/ticket-restriction/{id}:
 *   get:
 *     summary: get all Ticket Restrictions associated with a specific event instance for which there are tickets available
 *     tags:
 *     - New Ticket Restrictions
 *     parameters:
 *     - $ref: '#/components/parameters/id'
 *     responses:
 *       200:
 *         description: fetch successful
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               $ref: '#/components/schemas/TicketRestriction'
 *       400:
 *         description: bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message from the server.
 *       500:
 *         description: Internal Server Error. An error occurred while processing the request.
 */
ticketRestrictionController.get('/:id', async (req: Request, res: Response) => {
  try {
    const {id}= req.params;

    const ticketRestrictions = await prisma.ticketrestrictions.findMany({
      where: {
        eventinstances: {
          eventinstanceid: +id,
          availableseats: {gt: 0},
        },
        eventtickets: {
          some: {
            singleticket_fk: null,
          },
        },
      },
      include: {
        eventtickets: {
          where: {
            singleticket_fk: {not: null},
          },
        },
        tickettype: {
          select: {
            description: true,
          },
        },
      },
    });
    return res.json(
        ticketRestrictions.map((restriction) => {
          const {eventtickets, tickettype, ...restrictionData} = restriction;
          return {
            ...restrictionData,
            description: tickettype.description,
            ticketssold: eventtickets.length,
          };
        }));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(400).json({error: error.message});
      return;
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      res.status(400).json({error: error.message});
      return;
    }
    res.status(500).json({error: 'Internal Server Error'});
  }
});

/**
 * @swagger
 * /2/ticket-restriction/{id}/{tickettypeid}:
 *   get:
 *     summary: get the Ticket Restriction associated with a specific event instance/ticket type for which there are tickets available
 *     tags:
 *     - New Ticket Restrictions
 *     parameters:
 *     - $ref: '#/components/parameters/id'
 *     - $ref: '#/components/parameters/tickettypeid'
 *     responses:
 *       200:
 *         description: fetch successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketRestriction'
 *       400:
 *         description: bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message from the server.
 *       500:
 *         description: Internal Server Error. An error occurred while processing the request.
 */
ticketRestrictionController.get('/:id/:tickettypeid', async (req: Request, res: Response) => {
  try {
    const {id, tickettypeid} = req.params;

    const ticketRestriction = await prisma.ticketrestrictions.findFirst({
      where: {
        tickettypeid_fk: +tickettypeid,
        eventinstances: {
          eventinstanceid: +id,
          availableseats: {gt: 0},
        },
        eventtickets: {
          some: {
            singleticket_fk: null,
          },
        },
      },
      include: {
        eventtickets: {
          where: {
            singleticket_fk: {not: null},
          },
        },
        tickettype: {
          select: {
            description: true,
          },
        },
      },
    });
    if (!ticketRestriction) {
      return res.status(400).json({error: `Ticket type ${tickettypeid} not available for showing ${id}`});
    }
    const {eventtickets, tickettype, ...restrictionData} = ticketRestriction;
    return res.status(200).json({
      ...restrictionData,
      description: tickettype.description,
      ticketssold: eventtickets.length,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(400).json({error: error.message});
      return;
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      res.status(400).json({error: error.message});
      return;
    }
    res.status(500).json({error: 'Internal Server Error'});
  }
});

ticketRestrictionController.use(checkJwt);
ticketRestrictionController.use(checkScopes);
