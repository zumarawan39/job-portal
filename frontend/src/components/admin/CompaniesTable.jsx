import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Card, CardContent } from '../ui/card'
import { Edit2, MoreHorizontal } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

// Table that lists all registered companies, with an edit action for each
const CompaniesTable = () => {
    // Read the list of all companies and the current search text from the company slice in Redux
    const { companies, searchCompanyByText } = useSelector(store => store.company);
    // Companies left after filtering by the search text, this is what actually gets rendered
    const [filterCompany, setFilterCompany] = useState(companies);
    const navigate = useNavigate();
    // Re-run the filter whenever the company list or the search text changes
    useEffect(()=>{
        // Keep only companies whose name matches the search text
        const filteredCompany = companies.length >= 0 && companies.filter((company)=>{
            if(!searchCompanyByText){
                return true
            };
            return company?.name?.toLowerCase().includes(searchCompanyByText.toLowerCase());

        });
        setFilterCompany(filteredCompany);
    },[companies,searchCompanyByText])
    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableCaption className="pb-4">A list of your recent registered companies</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Logo</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            // Render one table row per filtered company
                            filterCompany?.map((company) => (
                                <TableRow key={company._id}>
                                    <TableCell>
                                        <Avatar className="border border-border">
                                            <AvatarImage src={company.logo}/>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">{company.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{company.createdAt.split("T")[0]}</TableCell>
                                    <TableCell className="text-right cursor-pointer">
                                        <Popover>
                                            <PopoverTrigger className="rounded-md p-1 hover:bg-accent">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </PopoverTrigger>
                                            <PopoverContent className="w-32 p-1">
                                                <div onClick={()=> navigate(`/admin/companies/${company._id}`)} className='flex items-center gap-2 w-full rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground'>
                                                    <Edit2 className='w-4 h-4' />
                                                    <span>Edit</span>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </TableCell>
                                </TableRow>

                            ))
                        }
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default CompaniesTable
