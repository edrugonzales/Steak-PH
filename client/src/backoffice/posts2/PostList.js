import * as React from 'react';
import { API } from "../../config";
import { Children, Fragment, cloneElement, memo } from 'react';
import BookIcon from '@material-ui/icons/Book';
import Chip from '@material-ui/core/Chip';
import { useMediaQuery } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import lodashGet from 'lodash/get';
import jsonExport from 'jsonexport/dist';
import {push} from 'react-router-redux';
import {
    BooleanField,
    BulkDeleteButton,
    BulkExportButton,
    ChipField,
    Datagrid,
    DateField,
    downloadCSV,
    EditButton,
    Filter,
    List,
    NumberField,
    ReferenceArrayField,
    SearchInput,
    ShowButton,
    SimpleList,
    SingleFieldList,
    TextField,
    TextInput,
    useTranslate,
    useRefresh,
    showNotification,
    useNotify, useRedirect, Pagination
} from 'react-admin'; // eslint-disable-line import/no-unresolved

import ResetViewsButton from './ResetViewsButton';
export const PostIcon = BookIcon;

const useQuickFilterStyles = makeStyles(theme => ({
    chip: {
        marginBottom: theme.spacing(1),
    },
}));
const QuickFilter = ({ label }) => {
    const translate = useTranslate();
    const classes = useQuickFilterStyles();
    return <Chip className={classes.chip} label={translate(label)} />;
};

const PostFilter = props => (
    <Filter {...props}>
        <SearchInput source="q" alwaysOn />
    </Filter>
);

const exporter = posts => {
    const data = posts.map(post => ({
        ...post,
        backlinks: lodashGet(post, 'backlinks', []).map(
            backlink => backlink.url
        ),
    }));
    jsonExport(data, (err, csv) => downloadCSV(csv, 'posts'));
};

const useStyles = makeStyles(theme => ({
    title: {
        maxWidth: '20em',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    hiddenOnSmallScreens: {
        [theme.breakpoints.down('md')]: {
            display: 'none',
        },
    },
    publishedAt: { fontStyle: 'italic' },
}));

const PostListBulkActions = memo(props => (
    <Fragment>
        <ResetViewsButton {...props} />
        <BulkDeleteButton {...props} />
        <BulkExportButton {...props} />
    </Fragment>
));

const usePostListActionToolbarStyles = makeStyles({
    toolbar: {
        alignItems: 'center',
        display: 'flex',
        marginTop: -1,
        marginBottom: -1,
    },
});

const PostListActionToolbar = ({ children, ...props }) => {
    const classes = usePostListActionToolbarStyles();
    return (
        <div className={classes.toolbar}>
            {Children.map(children, button => cloneElement(button, props))}
        </div>
    );
};


const PostPagination = props => <Pagination rowsPerPageOptions={[10, 25, 50, 100, 500]} {...props} />;


const PostList = props => {
    const refresh = useRefresh();
    const classes = useStyles();
    const notify = useNotify();
    const redirect = useRedirect();
    // const isSmall = useMediaQuery(theme => theme.breakpoints.down('sm'));
    const rowClick = (id, basePath, record) => {
        if(window.confirm(`${(record.status)? `Close and mark shop as inactive '${record.name}'` : `Open and mark shop as active '${record.name}'`}`)) {
            fetch(`${(process.env.REACT_APP_API_URL) ? `${API}` : '/api'}/shop-approval/${record.id}`, {
                method: "PUT",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({isActive: !record.status, status: !record.status})
            })
                .then(response => {
                    // showNotification(`${(!record.isActive)? `Disapprove '${record.name}'` : `Approve '${record.name}'`}`);
                    notify(`${(record.status)? `Close and mark shop as inactive '${record.name}'` : `Open and mark shop as active '${record.name}'`}`, 'warning');
                    redirect('list', props.basePath);
                    refresh();
                    console.log(response.json());
                    push('/');
                })
                .catch(err => {
                    console.log(err);
                });
        } else {
            console.log('Cancel');
        }
        // if (record.commentable) {
        //     return 'edit';
        // }
    
        return;
    };


  
    const PostPanel = ({ id, record, resource }) => (
        // <div dangerouslySetInnerHTML={{ __html: record.body }} />

        <div>
            <div style={{display: 'inline-block'}}>
                <p>Logo</p>
                <img width="300" style={{margin: 1 + 'em'}}
                    src={record.logo} />
            </div>
                
            <div style={{display: 'inline-block'}}>

                <p>Banner</p>
                <img width="300" style={{margin: 1 + 'em'}}
                    src={record.banner} />
            </div>

            <div style={{display: 'inline-block', margin: '0 10px'}}>

                <p><strong><u>Schedule - Mon -Sunday</u></strong></p>
                {/* <p> {record.schedule.map()} </p> */}

                {record.schedule && record.schedule.map((value, index) => {
                
                return(
                <p key={index}>
                    Day {index+1} : open - {value.open} close - {value.close}
                </p>)
            })}
            </div>

            <div style={{display: 'inline-block', margin: '0 10px'}}>

                <p><strong><u>Preparation</u></strong></p>
                <p> {record.preparation} </p>
            </div>

            <div style={{display: 'inline-block', margin: '0 10px'}}>

                <p><strong><u>Inspiration</u></strong></p>
                <p> {record.inspiration} </p>
            </div>

            <div style={{display: 'inline-block', margin: '0 10px'}}>

                <p><strong><u>Pick-up Notes</u></strong></p>
                <p> {record.pickupNotes} </p>
            </div>

            
        </div>
            
    );
    return (
        <List
            {...props}
            bulkActionButtons={<PostListBulkActions />}
            filters={<PostFilter />}
            sort={{ field: 'updatedAt', order: 'DESC' }}
            exporter={exporter}
            pagination={<PostPagination/>}

        >
                <Datagrid rowClick={rowClick} expand={PostPanel} optimized>
                    {/* <TextField source="_id" /> */}
                    <TextField source="name" cellClassName={classes.title} />
                    <DateField
                        source="updatedAt"
                        sortByOrder="ASC"
                        cellClassName={classes.createdDate}
                    />
                    <DateField
                        source="createdAt"
                        cellClassName={classes.createdDate}
                    />
                    <BooleanField source="hasLogo"/>
                    <BooleanField source="hasBanner"/>
                    <BooleanField source="status"/>
                    <BooleanField source="isActive" onClick={()=> {}}/>
                    <TextField source="merchantName" />
                    <TextField source="merchantPhone" />
                    <TextField source="merchantEmail" />
                    <TextField source="address" /> 
                    <TextField source="location" /> 
                    {/* location field */}
                    {/* <TextField source="quantity" /> */}
                   
                    
{/* 
                    <NumberField source="views" sortByOrder="DESC" />
                    <ReferenceArrayField
                        label="Tags"
                        reference="tags"
                        source="tags"
                        sortBy="tags.name"
                        sort={{ field: 'name', order: 'ASC' }}
                        cellClassName={classes.hiddenOnSmallScreens}
                        headerClassName={classes.hiddenOnSmallScreens}
                    >
                        <SingleFieldList>
                            <ChipField source="name" size="small" />
                        </SingleFieldList>
                    </ReferenceArrayField> */}
                    <PostListActionToolbar>
                        {/* <EditButton />
                        <ShowButton /> */}
                    </PostListActionToolbar>
                </Datagrid>
        </List>
    );
};

export default PostList;
