import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AccountBankService } from './account-bank.service';
import { CreateAccountBankDto } from './dto/create-account-bank.dto';

@ApiTags('account-banks')
@Controller('account-banks')
export class AccountBankController {
  constructor(private readonly accountBankService: AccountBankService) {}

  @ApiOperation({ summary: 'Create account bank' })
  @ApiCreatedResponse({ description: 'Account bank created successfully' })
  @Post()
  create(@Body() createAccountBankDto: CreateAccountBankDto) {
    return this.accountBankService.create(createAccountBankDto);
  }

  @ApiOperation({ summary: 'Get account bank list' })
  @ApiOkResponse({ description: 'Account bank list fetched successfully' })
  @Get()
  list() {
    return this.accountBankService.list();
  }

  @ApiOperation({ summary: 'Get default account bank' })
  @ApiOkResponse({ description: 'Default account bank fetched successfully' })
  @Get('default')
  getDefault() {
    return this.accountBankService.getDefault();
  }

  @ApiOperation({ summary: 'Set account bank as default' })
  @ApiParam({ name: 'id', description: 'Account bank id' })
  @ApiOkResponse({ description: 'Default account bank updated successfully' })
  @Patch(':id/default')
  updateDefault(@Param('id') id: string) {
    return this.accountBankService.updateDefault(id);
  }

  @ApiOperation({ summary: 'Delete account bank' })
  @ApiParam({ name: 'id', description: 'Account bank id' })
  @ApiOkResponse({ description: 'Account bank deleted successfully' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountBankService.remove(id);
  }
}
